const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Review = require('../models/Review');
const { protect, admin } = require('../middleware/auth');
const { uploadMultiple, handleMulterError } = require('../middleware/upload');
const { uploadMultipleToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

const router = express.Router();

// Validation middleware
const validateProduct = [
  body('name').trim().isLength({ min: 2, max: 200 }).withMessage('Product name must be between 2 and 200 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('price').isNumeric().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').isMongoId().withMessage('Valid category ID is required'),
  body('sku').trim().isLength({ min: 2, max: 50 }).withMessage('SKU must be between 2 and 50 characters'),
];

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build filter object
    let filter = { status: 'active' };
    let searchCriteria = null;

    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Brand filter
    if (req.query.brand) {
      filter.brand = new RegExp(req.query.brand, 'i');
    }

    // Featured filter
    if (req.query.featured === 'true') {
      filter.featured = true;
    }

    // In stock filter
    if (req.query.inStock === 'true') {
      filter['inventory.quantity'] = { $gt: 0 };
    }

    // Search query - using regex search for better flexibility
    if (req.query.search) {
      const searchTerm = req.query.search.trim();
      
      searchCriteria = {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { tags: { $regex: searchTerm, $options: 'i' } },
          { brand: { $regex: searchTerm, $options: 'i' } }
        ]
      };
    }

    // Combine filters
    const finalFilter = searchCriteria ? { $and: [filter, searchCriteria] } : filter;

    // Rating filter
    if (req.query.minRating) {
      filter.averageRating = { $gte: parseFloat(req.query.minRating) };
    }

    // Sort options
    let sort = {};
    switch (req.query.sortBy) {
      case 'price_low_to_high':
        sort.price = 1;
        break;
      case 'price_high_to_low':
        sort.price = -1;
        break;
      case 'newest':
        sort.createdAt = -1;
        break;
      case 'oldest':
        sort.createdAt = 1;
        break;
      case 'rating':
        sort.averageRating = -1;
        break;
      case 'popular':
        sort.salesCount = -1;
        break;
      case 'name_a_to_z':
        sort.name = 1;
        break;
      case 'name_z_to_a':
        sort.name = -1;
        break;
      default:
        sort.createdAt = -1;
    }

    // Default sorting for search results
    if (req.query.search && !req.query.sortBy) {
      sort.name = 1; // Sort by name for search results
    }

    // Execute query
    const products = await Product.find(finalFilter)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(finalFilter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: total,
        hasNextPage,
        hasPrevPage,
        productsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get products',
      error: error.message
    });
  }
});

// @desc    Get single product by ID or slug
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find by ID or slug
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };
    
    const product = await Product.findOne({ ...query, status: 'active' })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('relatedProducts', 'name slug price images averageRating reviewsCount')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    await Product.findByIdAndUpdate(product._id, { $inc: { viewsCount: 1 } });

    // Get reviews for this product
    const reviews = await Review.find({ product: product._id, isApproved: true })
      .populate('user', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      product: {
        ...product,
        reviews
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product',
      error: error.message
    });
  }
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, uploadMultiple, handleMulterError, validateProduct, async (req, res) => {
  try {
    console.log('Create product request body:', JSON.stringify(req.body, null, 2));
    console.log('Create product files:', req.files ? req.files.length : 0);
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const productData = { ...req.body };
    productData.createdBy = req.user.id;

    // Handle image uploads or URL-based images
    if (req.files && req.files.length > 0) {
      // File upload case
      try {
        const uploadedImages = await uploadMultipleToCloudinary(req.files, 'products');
        productData.images = uploadedImages.map((img, index) => ({
          public_id: img.public_id,
          url: img.url,
          isMain: index === 0 // First image is main
        }));
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Image upload failed',
          error: error.message
        });
      }
    } else if (productData.images && Array.isArray(productData.images)) {
      // URL-based image case (same logic as update route)
      const processedImages = productData.images
        .filter(img => img.url && img.url.trim() !== '') // Only keep images with valid URLs
        .map(img => ({
          public_id: img.public_id || `external_${Date.now()}_${Math.random().toString(36).substring(7)}`, // Generate unique fake public_id
          url: img.url,
          alt: img.alt || '',
          isMain: img.isMain || false
        }));
      
      if (processedImages.length > 0) {
        productData.images = processedImages;
      } else {
        delete productData.images; // Don't include images if no valid images
      }
    } else {
      // Remove images field if no files uploaded and no URL images
      delete productData.images;
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: productData.sku });
    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }

    // Verify category exists
    const category = await Category.findById(productData.category);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }

    const product = await Product.create(productData);
    
    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: populatedProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, uploadMultiple, handleMulterError, async (req, res) => {
  try {
    console.log('Update product ID received:', req.params.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Validate ObjectId format
    if (!req.params.id || req.params.id === 'undefined' || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Invalid ID format:', req.params.id);
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format'
      });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updateData = { ...req.body };
    updateData.updatedBy = req.user.id;

    // Handle image updates - either file uploads or URL updates
    if (req.files && req.files.length > 0) {
      // File upload case
      try {
        const uploadedImages = await uploadMultipleToCloudinary(req.files, 'products');
        const newImages = uploadedImages.map(img => ({
          public_id: img.public_id,
          url: img.url,
          isMain: false
        }));

        // Add new images to existing ones
        updateData.images = [...(product.images || []), ...newImages];
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Image upload failed',
          error: error.message
        });
      }
    } else if (updateData.images && Array.isArray(updateData.images)) {
      // URL-based image update case
      const processedImages = updateData.images
        .filter(img => img.url && img.url.trim() !== '') // Only keep images with valid URLs
        .map(img => ({
          public_id: img.public_id || `external_${Date.now()}_${Math.random().toString(36).substring(7)}`, // Generate unique fake public_id
          url: img.url,
          alt: img.alt || '',
          isMain: img.isMain || false
        }));
      
      if (processedImages.length > 0) {
        updateData.images = processedImages;
      } else {
        delete updateData.images; // Don't update images if no valid images
      }
    }

    // If no valid images, keep existing images
    if (!updateData.images || updateData.images.length === 0) {
      delete updateData.images; // Don't update images field
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).populate('category', 'name slug').populate('subcategory', 'name slug');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
});

// @desc    Delete product image
// @route   DELETE /api/products/:id/images/:imageId
// @access  Private/Admin
router.delete('/:id/images/:imageId', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const image = product.images.id(req.params.imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Delete from Cloudinary
    try {
      await deleteFromCloudinary(image.public_id);
    } catch (error) {
      console.error('Cloudinary delete error:', error);
    }

    // Remove from product
    product.images.pull(req.params.imageId);
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      try {
        const publicIds = product.images.map(img => img.public_id);
        await Promise.all(publicIds.map(id => deleteFromCloudinary(id)));
      } catch (error) {
        console.error('Cloudinary delete error:', error);
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
router.get('/featured/list', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    
    const products = await Product.find({ 
      status: 'active', 
      featured: true 
    })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get featured products',
      error: error.message
    });
  }
});

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
router.get('/:id/related', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const relatedProducts = await Product.find({
      _id: { $ne: req.params.id },
      category: product.category,
      status: 'active'
    })
      .populate('category', 'name slug')
      .limit(8)
      .lean();

    res.status(200).json({
      success: true,
      products: relatedProducts
    });
  } catch (error) {
    console.error('Get related products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get related products',
      error: error.message
    });
  }
});

module.exports = router;
