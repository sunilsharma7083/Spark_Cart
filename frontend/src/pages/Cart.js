import LoadingSpinner from "../components/common/LoadingSpinner";
import React from "react";
import useCart from "../hooks/useCart";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { addToWishlist, removeFromWishlist } from "../store/slices/wishlistSlice";

const Cart = () => {
  const dispatch = useDispatch();
  const { 
    items, 
    totalItems, 
    totalAmount, 
    loading, 
    error,
    removeFromCart, 
    updateQuantity, 
    clearCart 
  } = useCart();

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      await removeFromCart(itemId);
    } else {
      await updateQuantity(itemId, newQuantity);
    }
  };

  const handleMoveToWishlist = async (item) => {
    try {
      await dispatch(addToWishlist(item.product._id));
      await removeFromCart(item._id);
    } catch (error) {
      console.error('Error moving item to wishlist:', error);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Cart</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <Link 
            to="/products" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      {items.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="max-w-md mx-auto">
            <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.3 5.2a1 1 0 001 1.2h9.6a1 1 0 001-1.2L15 13M7 13v6a2 2 0 002 2h6a2 2 0 002-2v-6" />
            </svg>
            <h2 className="mt-6 text-xl font-medium text-gray-900">Your cart is empty</h2>
            <p className="mt-2 text-gray-500">Start shopping to add items to your cart</p>
            <Link 
              to="/products" 
              className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Cart Items */}
          <div className="lg:col-span-7">
            <div className="flow-root">
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -300 }}
                    transition={{ delay: index * 0.1 }}
                    className="py-6 border-b border-gray-200"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <img
                          className="h-24 w-24 rounded-md object-cover object-center"
                          src={item.product?.images?.[0]?.url || '/placeholder-image.svg'}
                          alt={item.product?.name || 'Product'}
                          onError={(e) => {
                            e.target.src = '/placeholder-image.svg';
                          }}
                        />
                      </div>

                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-gray-900">
                            <h3>
                              <Link to={`/products/${item.product?._id}`} className="hover:text-indigo-600">
                                {item.product?.name || 'Unknown Product'}
                              </Link>
                            </h3>
                            <p className="ml-4">₹{(item.product?.price || 0).toFixed(2)}</p>
                          </div>
                          {item.product?.brand && (
                            <p className="mt-1 text-sm text-gray-500">{item.product.brand}</p>
                          )}
                          {item.variant && Object.keys(item.variant).length > 0 && (
                            <div className="mt-1 text-sm text-gray-500">
                              {Object.entries(item.variant).map(([key, value]) => (
                                <span key={key} className="mr-2">
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          <div className="flex items-center">
                            <label htmlFor={`quantity-${item._id}`} className="mr-2 text-gray-500">
                              Qty:
                            </label>
                            <select
                              id={`quantity-${item._id}`}
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value))}
                              className="rounded border border-gray-300 text-left text-base font-medium text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              {[...Array(10)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {i + 1}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center space-x-4">
                            <button
                              type="button"
                              onClick={() => handleMoveToWishlist(item)}
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                              Move to wishlist
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item._id)}
                              className="text-sm font-medium text-red-600 hover:text-red-500"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Clear Cart Button */}
            {items.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={handleClearCart}
                  className="text-sm font-medium text-red-600 hover:text-red-500 border border-red-200 px-4 py-2 rounded-md hover:bg-red-50"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
            <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Items ({totalItems})</p>
                <p className="text-sm font-medium text-gray-900">₹{totalAmount.toFixed(2)}</p>
              </div>

              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <p className="text-base font-medium text-gray-900">Order Total</p>
                <p className="text-base font-medium text-gray-900">₹{totalAmount.toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/checkout"
                className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Proceed to Checkout
              </Link>
            </div>

            <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
              <p>
                or{' '}
                <Link to="/products" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Continue Shopping
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
