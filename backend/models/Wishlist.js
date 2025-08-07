const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalItems: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Update total items before saving
wishlistSchema.pre('save', function(next) {
  this.totalItems = this.products.length;
  next();
});

// Indexes
wishlistSchema.index({ user: 1 });
wishlistSchema.index({ 'products.product': 1 });

module.exports = mongoose.model('Wishlist', wishlistSchema);
