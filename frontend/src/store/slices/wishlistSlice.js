import api from "../../utils/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Async thunks
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/wishlist');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch wishlist'
      );
    }
  }
);

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.post('/wishlist', { productId });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add to wishlist'
      );
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/wishlist/${productId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove from wishlist'
      );
    }
  }
);

export const toggleWishlist = createAsyncThunk(
  'wishlist/toggleWishlist',
  async (productId, { getState, rejectWithValue }) => {
    try {
      const { wishlist } = getState();
      const isInWishlist = wishlist.items.some(item => item.product._id === productId);
      
      if (isInWishlist) {
        const response = await api.delete(`/wishlist/${productId}`);
        return response.data;
      } else {
        const response = await api.post('/wishlist', { productId });
        return response.data;
      }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to toggle wishlist'
      );
    }
  }
);

export const clearWishlist = createAsyncThunk(
  'wishlist/clearWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete('/wishlist');
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to clear wishlist'
      );
    }
  }
);

export const moveToCart = createAsyncThunk(
  'wishlist/moveToCart',
  async ({ productId, quantity = 1, size, color }, { rejectWithValue }) => {
    try {
      // First add to cart using the correct endpoint
      await api.post('/cart/items', {
        productId,
        quantity,
        selectedVariants: { size, color }
      });
      
      // Then remove from wishlist
      const response = await api.delete(`/wishlist/${productId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to move to cart'
      );
    }
  }
);

export const checkIfInWishlist = createAsyncThunk(
  'wishlist/checkIfInWishlist',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/wishlist/check/${productId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to check wishlist'
      );
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  totalItems: 0
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addItemLocal: (state, action) => {
      const item = action.payload;
      const existingItem = state.items.find(
        existing => existing.product._id === item.product._id
      );
      
      if (!existingItem) {
        state.items.push(item);
        state.totalItems = state.items.length;
      }
    },
    removeItemLocal: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter(item => item.product._id !== productId);
      state.totalItems = state.items.length;
    },
    clearWishlistLocal: (state) => {
      state.items = [];
      state.totalItems = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.wishlist?.products || [];
        state.totalItems = state.items.length;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add to wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.wishlist?.products || [];
        state.totalItems = state.items.length;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Remove from wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.wishlist?.products || [];
        state.totalItems = state.items.length;
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Toggle wishlist
      .addCase(toggleWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.wishlist?.products || [];
        state.totalItems = state.items.length;
      })
      .addCase(toggleWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Clear wishlist
      .addCase(clearWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearWishlist.fulfilled, (state) => {
        state.loading = false;
        state.items = [];
        state.totalItems = 0;
      })
      .addCase(clearWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Move to cart
      .addCase(moveToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moveToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.wishlist?.products || [];
        state.totalItems = state.items.length;
      })
      .addCase(moveToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Check if in wishlist
      .addCase(checkIfInWishlist.fulfilled, (state, action) => {
        // This doesn't modify state, just returns the result
      });
  }
});

export const { clearError, addItemLocal, removeItemLocal, clearWishlistLocal } = wishlistSlice.actions;
export default wishlistSlice.reducer;