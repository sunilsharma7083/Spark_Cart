import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

import { 
  CheckCircleIcon, 
  ShoppingBagIcon, 
  HomeIcon,
  PhoneIcon,
  EnvelopeIcon 
} from '@heroicons/react/24/outline';

const OrderSuccess = () => {
  const location = useLocation();
  const orderData = location.state?.orderData;

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          {/* Success Header */}
          <div className="bg-green-50 px-6 py-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Placed Successfully!
            </h1>
            {orderData?.orderId && (
              <p className="text-sm text-gray-500 mb-2">
                Order ID: #{orderData.orderId.slice(-8)}
              </p>
            )}
            <p className="text-lg text-gray-600">
              Thank you for your order. We'll send you a confirmation email shortly.
            </p>
          </div>

          {/* Order Details */}
          <div className="px-6 py-6">
            {orderData && (
              <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Summary</h3>
                  <div className="space-y-2">
                    {orderData.orderItems?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded"
                              onError={(e) => {
                                e.target.src = '/placeholder-image.svg';
                              }}
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-medium text-gray-900">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-4">
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-green-600">₹{orderData.totalPrice?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Method</h3>
                  <p className="text-gray-700">
                    <span className="font-medium">Cash on Delivery</span> - Pay when your order arrives
                  </p>
                </div>

                {/* Shipping Info */}
                {orderData.shippingInfo && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Delivery Address</h3>
                    <div className="text-gray-700">
                      <p>{orderData.shippingInfo.address}</p>
                      <p>
                        {orderData.shippingInfo.city}, {orderData.shippingInfo.state} {orderData.shippingInfo.zipCode}
                      </p>
                      <p>{orderData.shippingInfo.country}</p>
                      {orderData.shippingInfo.phone && (
                        <p className="mt-1">Phone: {orderData.shippingInfo.phone}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* What's Next */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What happens next?</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <p className="text-gray-700">We'll prepare your order and send you a confirmation email</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <p className="text-gray-700">Your order will be packed and shipped within 1-2 business days</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <p className="text-gray-700">Pay cash when your order is delivered to your doorstep</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-5 w-5 text-indigo-600" />
                  <span className="text-gray-700">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-5 w-5 text-indigo-600" />
                  <span className="text-gray-700">support@spartkart.com</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8">
              <Link
                to="/orders"
                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                <ShoppingBagIcon className="h-5 w-5 mr-2" />
                View My Orders
              </Link>
              <Link
                to="/"
                className="flex-1 border border-indigo-600 text-indigo-600 px-6 py-3 rounded-md font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center"
              >
                <HomeIcon className="h-5 w-5 mr-2" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccess;
