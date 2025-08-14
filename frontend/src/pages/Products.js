import LoadingSpinner from "../components/common/LoadingSpinner";
import ProductCard from "../components/product/ProductCard";
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchCategories } from "../store/slices/categorySlice";

import { 
  FunnelIcon, 
  Squares2X2Icon, 
  Bars3Icon,
  XMarkIcon,
  StarIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { 
  getProducts, 
  setFilters, 
  clearFilters,
  setSortBy 
} from '../store/slices/productSlice';

const Products = () => {
  console.log('Products component rendering...');
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [localFilters, setLocalFilters] = useState({
    categories: [],
    priceRange: [0, 1000],
    rating: 0,
    inStock: false,
    onSale: false
  });

  const dispatch = useDispatch();
  
  const { 
    products, 
    loading, 
    totalProducts, 
    totalPages, 
    currentPage,
    filters,
    sortBy 
  } = useSelector((state) => state.products);
  
  const { categories } = useSelector((state) => state.categories);

  console.log('Current state:', {
    products: products.length,
    loading,
    totalProducts,
    filters,
    sortBy
  });

  // Initialize filters from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    const sortParam = searchParams.get('sort');
    
    console.log('🔍 URL params useEffect:', { categoryParam, searchParam, sortParam });
    
    if (categoryParam || searchParam || sortParam) {
      const newFilters = {};
      if (categoryParam) newFilters.category = categoryParam;
      if (searchParam) newFilters.search = searchParam;
      
      console.log('✅ Setting URL-based filters:', newFilters);
      dispatch(setFilters(newFilters));
      if (sortParam) dispatch(setSortBy(sortParam));
      
      // Sync URL category filter with local filters
      if (categoryParam) {
        setLocalFilters(prev => ({
          ...prev,
          categories: [categoryParam]
        }));
      }
    }
    
    // Load categories if not already loaded
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [searchParams, dispatch, categories.length]);

  // Load products when filters change
  useEffect(() => {
    console.log('🔄 Products useEffect triggered');
    console.log('📊 Current filters:', filters);
    console.log('🔀 Current sortBy:', sortBy);
    console.log('📄 Current page:', currentPage);
    
    // Don't fetch if we're still initializing and there are URL params to process
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    
    // If URL has category but filters don't yet, wait for URL processing
    if (categoryParam && !filters.category) {
      console.log('⏳ Waiting for URL category filter to be processed...');
      return;
    }
    
    // Dispatch Redux action with proper parameters
    const paramsToSend = { 
      page: currentPage,
      ...filters,
      sortBy 
    };
    console.log('📤 Sending API params:', paramsToSend);
    
    dispatch(getProducts(paramsToSend));
  }, [dispatch, currentPage, filters, sortBy, searchParams]);

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...localFilters };
    
    if (filterType === 'categories') {
      if (newFilters.categories.includes(value)) {
        newFilters.categories = newFilters.categories.filter(cat => cat !== value);
      } else {
        newFilters.categories.push(value);
      }
    } else {
      newFilters[filterType] = value;
    }
    
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    const filtersToApply = {};
    
    // Check if we have a URL category parameter and preserve it
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      filtersToApply.category = categoryParam;
    } else if (localFilters.categories.length > 0) {
      filtersToApply.category = localFilters.categories.join(',');
    }
    
    if (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 1000) {
      filtersToApply.minPrice = localFilters.priceRange[0];
      filtersToApply.maxPrice = localFilters.priceRange[1];
    }
    
    if (localFilters.rating > 0) {
      filtersToApply.rating = localFilters.rating;
    }
    
    if (localFilters.inStock) {
      filtersToApply.inStock = true;
    }
    
    if (localFilters.onSale) {
      filtersToApply.onSale = true;
    }
    
    dispatch(setFilters(filtersToApply));
    setShowFilters(false);
  };

  const handleSortChange = (sortOption) => {
    dispatch(setSortBy(sortOption));
  };

  const handlePageChange = (page) => {
    dispatch(getProducts({ 
      page,
      ...filters,
      sortBy 
    }));
  };

  const clearAllFilters = () => {
    // Check if we have a URL category parameter that should be preserved
    const categoryParam = searchParams.get('category');
    
    console.log('🧹 clearAllFilters called, categoryParam:', categoryParam);
    
    setLocalFilters({
      categories: categoryParam ? [categoryParam] : [],
      priceRange: [0, 1000],
      rating: 0,
      inStock: false,
      onSale: false
    });
    
    // Only clear filters that are not from URL params
    const filtersToKeep = {};
    if (categoryParam) {
      filtersToKeep.category = categoryParam;
      console.log('🔒 Preserving URL category filter:', categoryParam);
    }
    
    dispatch(setFilters(filtersToKeep));
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_low_to_high', label: 'Price: Low to High' },
    { value: 'price_high_to_low', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' }
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

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <p className="mt-2 text-gray-600">
          Discover our amazing collection of products
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Results Count */}
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-600">
              Showing {products.length} of {totalProducts} products
            </p>
            {Object.keys(filters).length > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-indigo-600 hover:text-indigo-700"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 hover:text-gray-900'
                }`}
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 hover:text-gray-900'
                }`}
              >
                <Bars3Icon className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="hidden lg:block bg-white border border-gray-200 rounded-lg p-6 h-fit"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Categories</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category._id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={localFilters.categories.includes(category._id)}
                        onChange={() => handleFilterChange('categories', category._id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Price Range</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={localFilters.priceRange[1]}
                    onChange={(e) => handleFilterChange('priceRange', [0, parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>$0</span>
                    <span>₹{localFilters.priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Minimum Rating</h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center">
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        checked={localFilters.rating === rating}
                        onChange={() => handleFilterChange('rating', rating)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <div className="ml-2 flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${
                              i < rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                          />
                        ))}
                        <span className="ml-1 text-sm text-gray-600">& up</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Filters */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Additional</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localFilters.inStock}
                      onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">In Stock Only</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localFilters.onSale}
                      onChange={(e) => handleFilterChange('onSale', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-600">On Sale</span>
                  </label>
                </div>
              </div>

              {/* Apply Filters Button */}
              <button
                onClick={applyFilters}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Apply Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <AdjustmentsHorizontalIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              }
            >
              {products.map((product) => (
                <motion.div key={product._id} variants={itemVariants}>
                  <ProductCard product={product} viewMode={viewMode} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 flex"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setShowFilters(false)} />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl"
            >
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setShowFilters(false)}
                >
                  <XMarkIcon className="h-6 w-6 text-white" />
                </button>
              </div>

              <div className="flex-1 h-0 overflow-y-auto">
                <div className="p-6">
                  {/* Mobile filter content (same as desktop) */}
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Filters</h3>
                  {/* Add the same filter content as desktop */}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
