const express = require('express');
const { uploadSingle, uploadMultiple, handleMulterError } = require('../middleware/upload');
const { uploadToCloudinary, uploadMultipleToCloudinary } = require('../utils/cloudinary');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// @desc    Upload single image
// @route   POST /api/upload/single
// @access  Private/Admin
router.post('/single', protect, admin, uploadSingle, handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { folder = 'general' } = req.body;

    const result = await uploadToCloudinary(req.file.buffer, folder);

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      image: result
    });
  } catch (error) {
    console.error('Upload single image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
});

// @desc    Upload multiple images
// @route   POST /api/upload/multiple
// @access  Private/Admin
router.post('/multiple', protect, admin, uploadMultiple, handleMulterError, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const { folder = 'general' } = req.body;

    const results = await uploadMultipleToCloudinary(req.files, folder);

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      images: results
    });
  } catch (error) {
    console.error('Upload multiple images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message
    });
  }
});

module.exports = router;
