import { useDispatch, useSelector } from "react-redux";

import { 
  fetchCart, 
  addToCartBackend, 
  removeFromCartBackend, 
  updateCartItem, 
  clearCartBackend,
  addToCartLocal,
  removeFromCartLocal,
  updateCartItemLocal,
  clearCartLocal,
  setAuthenticationStatus
} from '../store/slices/cartSlice';

// Custom hook for cart operations
export const useCart = () => {
  const dispatch = useDispatch();
  const { 
    items, 
    totalItems, 
    totalAmount, 
    loading, 
    error, 
    isAuthenticated 
  } = useSelector(state => state.cart);

  // Initialize cart based on authentication status
  const initializeCart = () => {
    const token = localStorage.getItem('token');
    dispatch(setAuthenticationStatus(!!token));
    
    if (token) {
      dispatch(fetchCart());
    }
  };

  // Add to cart - automatically chooses backend or local
  const addToCart = async (product, quantity = 1, variant = {}) => {
    if (isAuthenticated) {
      return dispatch(addToCartBackend({ 
        productId: product._id, 
        quantity, 
        variant 
      }));
    } else {
      return dispatch(addToCartLocal({ 
        product, 
        quantity, 
        variant 
      }));
    }
  };

  // Remove from cart
  const removeFromCart = async (itemId) => {
    if (isAuthenticated) {
      return dispatch(removeFromCartBackend(itemId));
    } else {
      return dispatch(removeFromCartLocal(itemId));
    }
  };

  // Update cart item quantity
  const updateQuantity = async (itemId, quantity) => {
    if (isAuthenticated) {
      return dispatch(updateCartItem({ itemId, quantity }));
    } else {
      return dispatch(updateCartItemLocal({ itemId, quantity }));
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (isAuthenticated) {
      return dispatch(clearCartBackend());
    } else {
      return dispatch(clearCartLocal());
    }
  };

  // Get cart item count for a specific product
  const getProductQuantityInCart = (productId) => {
    const item = items.find(item => item.product._id === productId);
    return item ? item.quantity : 0;
  };

  // Check if product is in cart
  const isProductInCart = (productId) => {
    return items.some(item => item.product._id === productId);
  };

  return {
    // State
    items,
    totalItems,
    totalAmount,
    loading,
    error,
    isAuthenticated,
    
    // Actions
    initializeCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    
    // Utilities
    getProductQuantityInCart,
    isProductInCart
  };
};

export default useCart;
