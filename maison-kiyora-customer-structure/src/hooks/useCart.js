
/**
 * ======================================================
 * MAISON KIYORA
 * The Art of Slow Perfumery
 *
 * CUSTOM HOOK — useCart
 * ======================================================
 *
 * Centralized access to shopping cart state and actions.
 *
 * Features available:
 * - cartItems
 * - addToCart
 * - removeFromCart
 * - updateQuantity
 * - increaseQuantity
 * - decreaseQuantity
 * - clearCart
 * - cartCount
 * - cartSubtotal
 * - cartTotal
 * - isInCart
 * - getItemQuantity
 * - formatCartPrice
 *
 * The actual cart state and business logic live in:
 * src/context/CartContext.jsx
 *
 * This file provides a convenient import path:
 * import useCart from "../hooks/useCart.js";
 * ======================================================
 */

import {
  useCart as useCartContext,
} from "../context/CartContext.jsx";

/**
 * Access the Maison Kiyora shopping cart.
 *
 * Must be used inside <CartProvider>.
 *
 * @returns {Object} Cart state, totals and actions.
 */
export function useCart() {
  return useCartContext();
}

export default useCart;
