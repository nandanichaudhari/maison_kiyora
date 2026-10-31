
/**
 * ======================================================
 * MAISON KIYORA
 * The Art of Slow Perfumery
 *
 * CUSTOM HOOK — useWishlist
 * ======================================================
 *
 * Centralized access to wishlist state and actions.
 *
 * Available features:
 * - wishlistItems
 * - addToWishlist
 * - removeFromWishlist
 * - toggleWishlist
 * - clearWishlist
 * - isInWishlist
 * - wishlistCount
 * - isWishlistEmpty
 *
 * Wishlist state, persistence and business logic
 * are managed in:
 *
 * src/context/WishlistContext.jsx
 *
 * Usage:
 * import useWishlist from "../hooks/useWishlist.js";
 *
 * Requires <WishlistProvider> in the component tree.
 * ======================================================
 */

import {
  useWishlist as useWishlistContext,
} from "../context/WishlistContext.jsx";

/**
 * Access the Maison Kiyora wishlist.
 *
 * @returns {Object} Wishlist items, actions and state.
 */
export function useWishlist() {
  return useWishlistContext();
}

export default useWishlist;
