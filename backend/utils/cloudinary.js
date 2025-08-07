const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image to Cloudinary
exports.uploadToCloudinary = async (fileBuffer, folder = 'ecommerce') => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve({
              public_id: result.public_id,
              url: result.secure_url,
              width: result.width,
              height: result.height
            });
          }
        }
      ).end(fileBuffer);
    });
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};

// Upload multiple images to Cloudinary
exports.uploadMultipleToCloudinary = async (files, folder = 'ecommerce') => {
  try {
    const uploadPromises = files.map(file => 
      exports.uploadToCloudinary(file.buffer, folder)
    );
    
    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new Error(`Multiple upload failed: ${error.message}`);
  }
};

// Delete image from Cloudinary
exports.deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Cloudinary delete failed: ${error.message}`);
  }
};

// Delete multiple images from Cloudinary
exports.deleteMultipleFromCloudinary = async (publicIds) => {
  try {
    const deletePromises = publicIds.map(publicId => 
      exports.deleteFromCloudinary(publicId)
    );
    
    return await Promise.all(deletePromises);
  } catch (error) {
    throw new Error(`Multiple delete failed: ${error.message}`);
  }
};

// Generate transformation URL
exports.generateTransformationUrl = (publicId, transformations) => {
  return cloudinary.url(publicId, transformations);
};

// Get optimized image URL
exports.getOptimizedImageUrl = (publicId, options = {}) => {
  const defaultOptions = {
    quality: 'auto',
    fetch_format: 'auto',
    ...options
  };
  
  return cloudinary.url(publicId, defaultOptions);
};
