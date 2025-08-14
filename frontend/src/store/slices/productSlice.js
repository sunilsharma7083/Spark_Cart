import api from "../../utils/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      console.log('🚀 fetchProducts called with params:', params);
      // Clean up params to handle arrays properly
      const cleanParams = { ...params };
      
      // Handle priceRange array
      if (cleanParams.priceRange && Array.isArray(cleanParams.priceRange)) {
        cleanParams.minPrice = cleanParams.priceRange[0];
        cleanParams.maxPrice = cleanParams.priceRange[1];
        delete cleanParams.priceRange;
      }
      
      // Remove undefined or empty values
      Object.keys(cleanParams).forEach(key => {
        if (cleanParams[key] === undefined || cleanParams[key] === '' || cleanParams[key] === 'undefined') {
          delete cleanParams[key];
        }
      });
      
      const queryString = new URLSearchParams(cleanParams).toString();
      console.log('🌐 Making API call to:', `/products?${queryString}`);
      console.log('📋 Clean params sent to API:', cleanParams);
      const response = await api.get(`/products?${queryString}`);
      console.log('✅ API response products count:', response.data.products?.length);
      console.log('📊 API response pagination:', response.data.pagination);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch products'
      );
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch product'
      );
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create product'
      );
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update product'
      );
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/products/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete product'
      );
    }
  }
);

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Convert 'query' parameter to 'search' for backend compatibility
      const backendParams = { ...params };
      if (backendParams.query) {
        backendParams.search = backendParams.query;
        delete backendParams.query;
      }
      
      const queryString = new URLSearchParams(backendParams).toString();
      const response = await api.get(`/products?${queryString}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to search products'
      );
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/products/featured/list');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch featured products'
      );
    }
  }
);

const initialState = {
  products: [],
  currentProduct: null,
  featuredProducts: [],
  searchResults: [],
  totalPages: 0,
  currentPage: 1,
  totalProducts: 0,
  loading: false,
  searchLoading: false,
  error: null,
  filters: {
    category: '',
    priceRange: [0, 10000],
    brand: '',
    rating: 0,
  },
  sortBy: 'newest'
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    setFilters: (state, action) => {
      console.log('🔧 setFilters called with:', action.payload);
      console.log('🔧 Previous filters:', state.filters);
      state.filters = { ...state.filters, ...action.payload };
      console.log('🔧 New filters:', state.filters);
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        category: '',
        priceRange: [0, 10000],
        brand: '',
        rating: 0,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        console.log('fetchProducts.fulfilled payload:', action.payload);
        state.products = action.payload.products;
        state.totalPages = action.payload.pagination?.totalPages || 1;
        state.currentPage = action.payload.pagination?.currentPage || 1;
        state.totalProducts = action.payload.pagination?.totalProducts || 0;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch product by ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload.product;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.unshift(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update product
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.products.findIndex(
          product => product._id === action.payload._id
        );
        if (index !== -1) {
          state.products[index] = action.payload;
        }
        if (state.currentProduct?._id === action.payload._id) {
          state.currentProduct = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete product
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products = state.products.filter(
          product => product._id !== action.payload
        );
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.products;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload;
      })
      
      // Featured products
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredProducts = action.payload.products || action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearCurrentProduct,
  clearSearchResults,
  setFilters,
  clearFilters,
  clearError,
  setSortBy
} = productSlice.actions;

// Export async thunks
export { 
  fetchProducts as getProducts,
  fetchProductById as getProduct,
  fetchFeaturedProducts as getRelatedProducts
};

export default productSlice.reducer;
