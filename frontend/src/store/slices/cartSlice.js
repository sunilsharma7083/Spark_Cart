import api from "../../utils/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// Async thunk for fetching cart
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/cart');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

// Async thunk for adding item to cart (backend)
export const addToCartBackend = createAsyncThunk(
  'cart/addToCartBackend',
  async ({ productId, quantity = 1, variant = {} }, { rejectWithValue }) => {
    try {
      const response = await api.post('/cart/items', {
        productId,
        quantity,
        selectedVariants: variant
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add item to cart');
    }
  }
);

// Async thunk for updating cart item
export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/cart/items/${itemId}`, { quantity });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart item');
    }
  }
);

// Async thunk for removing item from cart (backend)
export const removeFromCartBackend = createAsyncThunk(
  'cart/removeFromCartBackend',
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/cart/items/${itemId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item from cart');
    }
  }
);

// Async thunk for clearing cart (backend)
export const clearCartBackend = createAsyncThunk(
  'cart/clearCartBackend',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete('/cart');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear cart');
    }
  }
);

// Local storage cart operations
const getCartFromStorage = () => {
  try {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error parsing cart from localStorage:', error);
    return [];
  }
};

const saveCartToStorage = (items) => {
  try {
    localStorage.setItem('cart', JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

const calculateTotals = (items) => {
  // Ensure items is an array
  if (!Array.isArray(items)) {
    return { totalItems: 0, totalAmount: 0 };
  }
  
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = items.reduce((total, item) => {
    const price = item.product?.price || 0;
    return total + (price * item.quantity);
  }, 0);
  
  return { totalItems, totalAmount };
};

const initialState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  loading: false,
  error: null,
  isAuthenticated: false, // Track authentication status for cart operations
};

// Initialize items from storage and calculate totals
const storageItems = getCartFromStorage();
initialState.items = Array.isArray(storageItems) ? storageItems : [];
const { totalItems, totalAmount } = calculateTotals(initialState.items);
initialState.totalItems = totalItems;
initialState.totalAmount = totalAmount;

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Set authentication status
    setAuthenticationStatus: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    
    // Local cart operations (for non-authenticated users)
    addToCartLocal: (state, action) => {
      const { product, quantity = 1, variant = {} } = action.payload;
      
      // Check if item already exists
      const existingItemIndex = state.items.findIndex(item => 
        item.product._id === product._id && 
        JSON.stringify(item.variant) === JSON.stringify(variant)
      );
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        state.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        state.items.push({
          _id: Date.now().toString(), // Temporary ID for local items
          product,
          quantity,
          variant,
          addedAt: new Date().toISOString()
        });
      }
      
      // Recalculate totals
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalAmount = totals.totalAmount;
      
      // Save to localStorage
      saveCartToStorage(state.items);
    },
    
    updateCartItemLocal: (state, action) => {
      const { itemId, quantity } = action.payload;
      const itemIndex = state.items.findIndex(item => item._id === itemId);
      
      if (itemIndex >= 0) {
        if (quantity <= 0) {
          state.items.splice(itemIndex, 1);
        } else {
          state.items[itemIndex].quantity = quantity;
        }
        
        // Recalculate totals
        const totals = calculateTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalAmount = totals.totalAmount;
        
        // Save to localStorage
        saveCartToStorage(state.items);
      }
    },
    
    removeFromCartLocal: (state, action) => {
      const itemId = action.payload;
      state.items = state.items.filter(item => item._id !== itemId);
      
      // Recalculate totals
      const totals = calculateTotals(state.items);
      state.totalItems = totals.totalItems;
      state.totalAmount = totals.totalAmount;
      
      // Save to localStorage
      saveCartToStorage(state.items);
    },
    
    clearCartLocal: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalAmount = 0;
      state.error = null;
      
      // Clear localStorage
      localStorage.removeItem('cart');
    },
    
    // Clear cart state (for logout)
    clearCartState: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalAmount = 0;
      state.loading = false;
      state.error = null;
      state.isAuthenticated = false;
    }
  },
  extraReducers: (builder) => {
    // Fetch cart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.cart?.items || [];
        const totals = calculateTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalAmount = totals.totalAmount;
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
    // Add to cart (backend)
    builder
      .addCase(addToCartBackend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCartBackend.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.cart?.items || [];
        const totals = calculateTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalAmount = totals.totalAmount;
        state.error = null;
      })
      .addCase(addToCartBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
    // Update cart item
    builder
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.cart?.items || [];
        const totals = calculateTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalAmount = totals.totalAmount;
        state.error = null;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
    // Remove from cart (backend)
    builder
      .addCase(removeFromCartBackend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCartBackend.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.cart?.items || [];
        const totals = calculateTotals(state.items);
        state.totalItems = totals.totalItems;
        state.totalAmount = totals.totalAmount;
        state.error = null;
      })
      .addCase(removeFromCartBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
    // Clear cart (backend)
    builder
      .addCase(clearCartBackend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(clearCartBackend.fulfilled, (state, action) => {
        state.loading = false;
        state.items = [];
        state.totalItems = 0;
        state.totalAmount = 0;
        state.error = null;
      })
      .addCase(clearCartBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setAuthenticationStatus,
  addToCartLocal,
  updateCartItemLocal,
  removeFromCartLocal,
  clearCartLocal,
  clearCartState
} = cartSlice.actions;

export default cartSlice.reducer;
