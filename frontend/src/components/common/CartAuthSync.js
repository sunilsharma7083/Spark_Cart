import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, setAuthenticationStatus } from "../../store/slices/cartSlice";

// Component to handle cart authentication synchronization
const CartAuthSync = () => {
  const dispatch = useDispatch();
  const isAuthAuthenticated = useSelector(state => state.auth?.isAuthenticated || false);
  const isCartAuthenticated = useSelector(state => state.cart?.isAuthenticated || false);

  useEffect(() => {
    // Sync cart authentication status with auth status
    if (isAuthAuthenticated !== isCartAuthenticated) {
      dispatch(setAuthenticationStatus(isAuthAuthenticated));
      
      // If user just logged in, fetch their cart from backend
      if (isAuthAuthenticated && !isCartAuthenticated) {
        dispatch(fetchCart());
      }
    }
  }, [dispatch, isAuthAuthenticated, isCartAuthenticated]);

  return null; // This component doesn't render anything
};

export default CartAuthSync;
