import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWishlist } from "../../store/slices/wishlistSlice";

// Component to handle wishlist authentication synchronization
const WishlistAuthSync = () => {
  const dispatch = useDispatch();
  const isAuthAuthenticated = useSelector(state => state.auth?.isAuthenticated || false);

  useEffect(() => {
    // If user is authenticated, fetch their wishlist from backend
    if (isAuthAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthAuthenticated]);

  return null; // This component doesn't render anything
};

export default WishlistAuthSync;
