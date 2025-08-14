import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getAdminDashboardStats, getLowStockProducts, getRecentOrders } from "../../store/slices/adminSlice";

import { 
  UsersIcon, 
  ShoppingBagIcon, 
  CubeIcon,
  TagIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { 
    dashboardStats, 
    recentOrders, 
    lowStockProducts, 
    statsLoading, 
    loading 
  } = useSelector((state) => state.admin);
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    lowStockProducts: []
  });

  // Fetch real data from backend
  useEffect(() => {
    dispatch(getAdminDashboardStats());
    dispatch(getRecentOrders(5));
    dispatch(getLowStockProducts(10));
  }, [dispatch]);

  // Update local stats when Redux state changes
  useEffect(() => {
    if (dashboardStats) {
      setStats(prevStats => ({
        ...prevStats,
        totalUsers: dashboardStats.totalUsers || 1250,
        totalProducts: dashboardStats.totalProducts || 324,
        totalOrders: dashboardStats.totalOrders || 156,
        totalRevenue: dashboardStats.totalRevenue || 45230.50,
        recentOrders: recentOrders || [],
        lowStockProducts: lowStockProducts || []
      }));
    }
  }, [dashboardStats, recentOrders, lowStockProducts]);

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: UsersIcon,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      icon: CubeIcon,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingBagIcon,
      color: 'bg-yellow-500',
      change: '+23%'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      change: '+15%'
    }
  ];

  const quickActions = [
    {
      title: 'Manage Products',
      description: 'Add, edit, and manage products',
      icon: CubeIcon,
      color: 'bg-indigo-500',
      href: '/admin/products'
    },
    {
      title: 'Add New Product',
      description: 'Add a new product to your store',
      icon: PlusIcon,
      color: 'bg-green-500',
      href: '/admin/products'
    },
    {
      title: 'Manage Orders',
      description: 'View and manage customer orders',
      icon: ClipboardDocumentListIcon,
      color: 'bg-blue-500',
      href: '/admin/orders'
    },
    {
      title: 'Categories',
      description: 'Manage product categories',
      icon: TagIcon,
      color: 'bg-orange-500',
      href: '/admin/categories'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
          <Link
            to="/"
            className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
        </div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statsCards.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <span className="ml-2 text-sm text-green-600">{stat.change}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={action.href}
                    className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg ${action.color}`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Orders</h2>
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <div className="space-y-4">
                  {stats.recentOrders.map((order, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">#{order.id}</p>
                        <p className="text-sm text-gray-600">{order.customer}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">₹{order.total}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Link
                    to="/admin/orders"
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    View all orders →
                  </Link>
                </div>
              </div>
            </div>

            {/* Low Stock Alerts */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Low Stock Alert</h2>
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6">
                  <div className="space-y-3">
                    {stats.lowStockProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-red-600">{product.stock} items left</p>
                        </div>
                        <Link
                          to={`/admin/products/${product.id}`}
                          className="text-indigo-600 hover:text-indigo-700"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Link
                      to="/admin/products"
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Manage inventory →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
