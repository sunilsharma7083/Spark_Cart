const express = require('express');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate({
        path: 'products.product',
        select: 'name slug price images averageRating reviewsCount status inventory',
        populate: {
          path: 'category',
          select: 'name slug'
        }
      });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    }

    // Filter out inactive products
    const activeProducts = wishlist.products.filter(item => 
      item.product && item.product.status === 'active'
    );

    if (activeProducts.length !== wishlist.products.length) {
      wishlist.products = activeProducts;
      await wishlist.save();
    }

    res.status(200).json({
      success: true,
      wishlist
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get wishlist',
      error: error.message
    });
  }
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || product.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Product not found or inactive'
      });
    }

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.id, products: [] });
    }

    // Check if product already in wishlist
    const existingProduct = wishlist.products.find(item => 
      item.product.toString() === productId
    );

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    // Add product to wishlist
    wishlist.products.push({ product: productId });
    await wishlist.save();

    // Update product wishlist count
    await Product.findByIdAndUpdate(productId, {
      $inc: { wishlistCount: 1 }
    });

    // Populate and return updated wishlist
    const populatedWishlist = await Wishlist.findById(wishlist._id)
      .populate({
        path: 'products.product',
        select: 'name slug price images averageRating reviewsCount status inventory',
        populate: {
          path: 'category',
          select: 'name slug'
        }
      });

    res.status(200).json({
      success: true,
      message: 'Product added to wishlist successfully',
      wishlist: populatedWishlist
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to wishlist',
      error: error.message
    });
  }
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
router.delete('/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Find and remove product
    const productIndex = wishlist.products.findIndex(item => 
      item.product.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in wishlist'
      });
    }

    wishlist.products.splice(productIndex, 1);
    await wishlist.save();

    // Update product wishlist count
    await Product.findByIdAndUpdate(productId, {
      $inc: { wishlistCount: -1 }
    });

    // Populate and return updated wishlist
    const populatedWishlist = await Wishlist.findById(wishlist._id)
      .populate({
        path: 'products.product',
        select: 'name slug price images averageRating reviewsCount status inventory',
        populate: {
          path: 'category',
          select: 'name slug'
        }
      });

    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist successfully',
      wishlist: populatedWishlist
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove product from wishlist',
      error: error.message
    });
  }
});

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
router.get('/check/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user.id });
    
    const isInWishlist = wishlist ? 
      wishlist.products.some(item => item.product.toString() === productId) : 
      false;

    res.status(200).json({
      success: true,
      isInWishlist
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check wishlist',
      error: error.message
    });
  }
});

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
router.delete('/', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Update wishlist count for all products
    const productIds = wishlist.products.map(item => item.product);
    await Product.updateMany(
      { _id: { $in: productIds } },
      { $inc: { wishlistCount: -1 } }
    );

    wishlist.products = [];
    await wishlist.save();

    res.status(200).json({
      success: true,
      message: 'Wishlist cleared successfully',
      wishlist
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear wishlist',
      error: error.message
    });
  }
});

module.exports = router;
