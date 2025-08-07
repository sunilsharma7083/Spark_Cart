const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/auth');
const { uploadSingle, handleMulterError } = require('../middleware/upload');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

const router = express.Router();

// Validation middleware
const validateCategory = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Category name must be between 2 and 100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { includeInactive = 'false' } = req.query;
    
    let filter = {};
    if (includeInactive !== 'true') {
      filter.isActive = true;
    }

    const categories = await Category.find(filter)
      .populate('subcategories')
      .populate('productsCount')
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    // Build hierarchical structure
    const categoryTree = categories.filter(cat => !cat.parent);
    const subcategories = categories.filter(cat => cat.parent);

    categoryTree.forEach(parent => {
      parent.children = subcategories.filter(sub => 
        sub.parent.toString() === parent._id.toString()
      );
    });

    res.status(200).json({
      success: true,
      categories: categoryTree,
      total: categories.length
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories',
      error: error.message
    });
  }
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find by ID or slug
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { slug: id };
    
    const category = await Category.findOne({ ...query, isActive: true })
      .populate('subcategories')
      .populate('productsCount')
      .lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get products in this category
    const products = await Product.find({ 
      category: category._id, 
      status: 'active' 
    })
      .populate('category', 'name slug')
      .limit(12)
      .lean();

    res.status(200).json({
      success: true,
      category: {
        ...category,
        products
      }
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get category',
      error: error.message
    });
  }
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
router.post('/', protect, admin, uploadSingle, handleMulterError, validateCategory, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const categoryData = { ...req.body };

    // Handle image upload
    if (req.file) {
      try {
        const uploadedImage = await uploadToCloudinary(req.file.buffer, 'categories');
        categoryData.image = {
          public_id: uploadedImage.public_id,
          url: uploadedImage.url
        };
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Image upload failed',
          error: error.message
        });
      }
    }

    // Check if category name already exists
    const existingCategory = await Category.findOne({ 
      name: new RegExp(`^${categoryData.name}$`, 'i') 
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    // If parent is specified, verify it exists
    if (categoryData.parent) {
      const parentCategory = await Category.findById(categoryData.parent);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found'
        });
      }
    }

    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
router.put('/:id', protect, admin, uploadSingle, handleMulterError, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const updateData = { ...req.body };

    // Handle new image upload
    if (req.file) {
      try {
        // Delete old image from Cloudinary
        if (category.image && category.image.public_id) {
          await deleteFromCloudinary(category.image.public_id);
        }

        // Upload new image
        const uploadedImage = await uploadToCloudinary(req.file.buffer, 'categories');
        updateData.image = {
          public_id: uploadedImage.public_id,
          url: uploadedImage.url
        };
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Image upload failed',
          error: error.message
        });
      }
    }

    // Check if new name conflicts with existing categories
    if (updateData.name && updateData.name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: new RegExp(`^${updateData.name}$`, 'i'),
        _id: { $ne: req.params.id }
      });
      
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${productCount} products associated with it.`
      });
    }

    // Check if category has subcategories
    const subcategoryCount = await Category.countDocuments({ parent: req.params.id });
    if (subcategoryCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${subcategoryCount} subcategories.`
      });
    }

    // Delete image from Cloudinary
    if (category.image && category.image.public_id) {
      try {
        await deleteFromCloudinary(category.image.public_id);
      } catch (error) {
        console.error('Cloudinary delete error:', error);
      }
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
});

// @desc    Get category hierarchy
// @route   GET /api/categories/hierarchy
// @access  Public
router.get('/hierarchy/tree', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    // Build tree structure
    const categoryMap = new Map();
    const roots = [];

    // First pass: create map of all categories
    categories.forEach(category => {
      categoryMap.set(category._id.toString(), { ...category, children: [] });
    });

    // Second pass: build tree structure
    categories.forEach(category => {
      const categoryNode = categoryMap.get(category._id.toString());
      
      if (category.parent) {
        const parent = categoryMap.get(category.parent.toString());
        if (parent) {
          parent.children.push(categoryNode);
        }
      } else {
        roots.push(categoryNode);
      }
    });

    res.status(200).json({
      success: true,
      categories: roots
    });
  } catch (error) {
    console.error('Get category hierarchy error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get category hierarchy',
      error: error.message
    });
  }
});

// @desc    Update category sort order
// @route   PUT /api/categories/sort-order
// @access  Private/Admin
router.put('/sort-order', protect, admin, async (req, res) => {
  try {
    const { categories } = req.body;

    if (!Array.isArray(categories)) {
      return res.status(400).json({
        success: false,
        message: 'Categories array is required'
      });
    }

    // Update sort order for each category
    const updatePromises = categories.map((item, index) => 
      Category.findByIdAndUpdate(item.id, { sortOrder: index })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: 'Category order updated successfully'
    });
  } catch (error) {
    console.error('Update category order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category order',
      error: error.message
    });
  }
});

module.exports = router;
