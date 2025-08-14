import LoadingSpinner from "../components/common/LoadingSpinner";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchUserOrders } from "../store/slices/orderSlice";

const Orders = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    console.log('Orders component mounted, fetching user orders...');
    dispatch(fetchUserOrders());
  }, [dispatch]);

  console.log('Orders component state:', { orders, loading, error });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Orders</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
          
          {orders && orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Order #{order._id?.slice(-8)?.toUpperCase() || 'N/A'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'Unknown date'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : order.status === 'processing'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status ? 
                            order.status.charAt(0).toUpperCase() + order.status.slice(1) :
                            'Unknown'
                          }
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          Total: <span className="font-semibold">₹{order.totalAmount?.toFixed(2) || '0.00'}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="px-6 py-4">
                    <div className="space-y-4">
                      {(order.items || order.orderItems || []).map((item, index) => (
                        <div key={item._id || index} className="flex items-center space-x-4">
                          <img
                            src={item.productImage?.url || item.image || '/placeholder-image.svg'}
                            alt={item.productName || item.name || 'Product'}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = '/placeholder-image.svg';
                            }}
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {item.productName || item.name || 'Unknown Product'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity || 1}
                            </p>
                            <p className="text-sm text-gray-600">
                              Price: ₹{(item.unitPrice || item.price || 0).toFixed(2)} each
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              ₹{(item.totalPrice || ((item.unitPrice || item.price || 0) * (item.quantity || 1))).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Information */}
                  {order.shippingInfo && (
                    <div className="bg-gray-50 px-6 py-4 border-t">
                      <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                      <p className="text-sm text-gray-600">
                        {order.shippingInfo.address}, {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zipCode}
                      </p>
                      {order.shippingInfo.country && (
                        <p className="text-sm text-gray-600">{order.shippingInfo.country}</p>
                      )}
                      {order.shippingInfo.phone && (
                        <p className="text-sm text-gray-600">Phone: {order.shippingInfo.phone}</p>
                      )}
                    </div>
                  )}

                  {/* Order Actions */}
                  <div className="px-6 py-4 border-t bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-4">
                        {order.orderStatus === 'delivered' && (
                          <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                            Leave Review
                          </button>
                        )}
                        {(order.orderStatus === 'pending' || order.orderStatus === 'processing') && (
                          <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                <h2 className="mt-4 text-2xl font-bold text-gray-900">No orders yet</h2>
                <p className="mt-2 text-gray-600">
                  When you place your first order, it will appear here.
                </p>
                <Link
                  to="/products"
                  className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Start Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
