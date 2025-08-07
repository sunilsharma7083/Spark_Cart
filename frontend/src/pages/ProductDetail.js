import LoadingSpinner from "../components/common/LoadingSpinner";
import ProductCard from "../components/product/ProductCard";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useCart from "../hooks/useCart";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getProduct, getRelatedProducts } from "../store/slices/productSlice";
import { toggleWishlist } from "../store/slices/wishlistSlice";

import { 
  HeartIcon, 
  ShoppingCartIcon, 
  StarIcon,
  ShareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const ProductDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  const { user } = useSelector((state) => state.auth || {});
  const { 
    currentProduct: product, 
    relatedProducts,
    loading, 
    error 
  } = useSelector((state) => state.products || {});
  const { items: wishlistItems } = useSelector((state) => state.wishlist || {});

  const isInWishlist = wishlistItems.some(item => item.product._id === id);

  useEffect(() => {
    if (id) {
      dispatch(getProduct(id));
      dispatch(getRelatedProducts(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (product?.sizes?.length > 0 && !selectedSize) {
      setSelectedSize(product.sizes[0]);
    }
    if (product?.colors?.length > 0 && !selectedColor) {
      setSelectedColor(product.colors[0]);
    }
  }, [product, selectedSize, selectedColor]);

  const handleAddToCart = () => {
    if ((product?.inventory?.quantity || 0) === 0) {
      toast.error('Product is out of stock');
      return;
    }

    addToCart(product, quantity, {
      size: selectedSize,
      color: selectedColor
    });
    toast.success('Added to cart!');
  };

  const handleWishlistToggle = () => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      navigate('/login');
      return;
    }

    dispatch(toggleWishlist(product._id));
    
    if (isInWishlist) {
      toast.success('Removed from wishlist');
    } else {
      toast.success('Added to wishlist!');
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const handleImageNavigation = (direction) => {
    if (!product?.images?.length) return;
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <StarIcon
        key={i}
        className={`h-5 w-5 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Product Not Found</h2>
        <p className="mt-2 text-gray-600">{error}</p>
        <button
          onClick={() => navigate('/products')}
          className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
        >
          Back to Products
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Product Not Found</h2>
        <p className="mt-2 text-gray-600">The product you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/products')}
          className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
        >
          Back to Products
        </button>
      </div>
    );
  }

  const discountPercentage = product?.originalPrice && product.price < product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-500">
              Home
            </button>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="flex-shrink-0 h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <button onClick={() => navigate('/products')} className="ml-2 text-gray-400 hover:text-gray-500">
                Products
              </button>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="flex-shrink-0 h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-2 text-gray-500 font-medium">{product?.name || 'Product'}</span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="lg:grid lg:grid-cols-2 lg:gap-8">
        {/* Product Images */}
        <div className="mb-8 lg:mb-0">
          <div className="relative">
            {/* Main Image */}
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={product.images?.[currentImageIndex]?.url || '/placeholder-image.svg'}
                alt={product?.name || 'Product'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder-image.svg';
                }}
              />
              
              {/* Discount Badge */}
              {discountPercentage > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  -{discountPercentage}% OFF
                </div>
              )}

              {/* Navigation Arrows */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={() => handleImageNavigation('prev')}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleImageNavigation('next')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="mt-4 flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                      index === currentImageIndex ? 'border-indigo-600' : 'border-gray-300'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product?.name || 'Product'} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div>
          {/* Category */}
          <p className="text-sm text-indigo-600 font-medium mb-2">
            {product.category?.name}
          </p>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {product?.name || 'Loading...'}
          </h1>

          {/* Rating */}
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {renderStars(product.averageRating || 0)}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              ({product.numReviews || 0} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-gray-900">
                ${product?.price || '0.00'}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xl text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            {discountPercentage > 0 && (
              <p className="text-sm text-green-600 mt-1">
                You save ${(product.originalPrice - product.price).toFixed(2)} ({discountPercentage}% off)
              </p>
            )}
          </div>

          {/* Short Description */}
          <p className="text-gray-600 mb-6">
            {product.shortDescription || (product.description?.substring(0, 150) + '...' || '')}
          </p>

          {/* Variants */}
          <div className="space-y-4 mb-6">
            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Size</h4>
                <div className="flex space-x-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-md text-sm font-medium ${
                        selectedSize === size
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Color</h4>
                <div className="flex space-x-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border rounded-md text-sm font-medium ${
                        selectedColor === color
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Quantity</h4>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <span className="text-lg">-</span>
                </button>
                <span className="text-lg font-medium w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.inventory?.quantity || 0, quantity + 1))}
                  className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={quantity >= (product.inventory?.quantity || 0)}
                >
                  <span className="text-lg">+</span>
                </button>
                <span className="text-sm text-gray-500 ml-2">
                  ({product.inventory?.quantity || 0} available)
                </span>
              </div>
            </div>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {(product.inventory?.quantity || 0) > 0 ? (
              <div className="flex items-center text-green-600">
                <CheckIcon className="h-5 w-5 mr-2" />
                <span className="text-sm font-medium">In Stock ({product.inventory?.quantity || 0} available)</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <span className="text-sm font-medium">Out of Stock</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={product.inventory?.quantity === 0}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              <span>Add to Cart</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleBuyNow}
                disabled={product.inventory?.quantity === 0}
                className="bg-gray-900 text-white py-3 px-4 rounded-md font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
              
              <button
                onClick={handleWishlistToggle}
                className={`border py-3 px-4 rounded-md font-medium flex items-center justify-center space-x-2 ${
                  isInWishlist
                    ? 'border-red-300 text-red-600 bg-red-50'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {isInWishlist ? (
                  <HeartSolidIcon className="h-5 w-5" />
                ) : (
                  <HeartIcon className="h-5 w-5" />
                )}
                <span>{isInWishlist ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>

          {/* Share */}
          <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-700">
            <ShareIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Share</span>
          </button>

          {/* Features */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center space-x-3">
              <TruckIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">Free shipping on orders over $50</span>
            </div>
            <div className="flex items-center space-x-3">
              <ArrowPathIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">30-day return policy</span>
            </div>
            <div className="flex items-center space-x-3">
              <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">1-year warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-16">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'description' && (
                <div className="prose max-w-none">
                  <p className="text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {product.specifications ? (
                    Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="border-b border-gray-200 pb-2">
                        <dt className="text-sm font-medium text-gray-900">{key}</dt>
                        <dd className="text-sm text-gray-600">{value}</dd>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No specifications available.</p>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Customer Reviews</h3>
                    <div className="mt-2 flex items-center">
                      <div className="flex items-center">
                        {renderStars(product.averageRating || 0)}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        Based on {product.numReviews || 0} reviews
                      </span>
                    </div>
                  </div>
                  
                  {product.reviews && product.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {product.reviews.map((review) => (
                        <div key={review._id} className="border-b border-gray-200 pb-6">
                          <div className="flex items-center mb-2">
                            <div className="flex items-center">
                              {renderStars(review.rating)}
                            </div>
                            <span className="ml-2 text-sm font-medium">{review.user.name}</span>
                            <span className="ml-2 text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-600">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((relatedProduct) => (
              <ProductCard key={relatedProduct._id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
