
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";

import App from "./App.jsx";

import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import { WishlistProvider } from "./context/WishlistContext.jsx";

import "./styles/global.css";
import "react-toastify/dist/ReactToastify.css";

// ======================================================
// MAISON KIYORA — APPLICATION ENTRY POINT
// React 19 + Vite + React Router + React Query
// ======================================================

// ======================================================
// 01. REACT QUERY CLIENT
// ======================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchInterval: false,
    },
    mutations: {
      // Prevent automatic retries for payments/orders.
      retry: 0,
    },
  },
});

// ======================================================
// 02. NOTIFICATION STYLES
// ======================================================

const toastStyles = {
  background: "#F5F0E8",
  color: "#211C19",
  border: "1px solid #D8C9B5",
  borderRadius: "4px",
  fontFamily: '"Manrope", Arial, sans-serif',
  fontSize: "13px",
  lineHeight: "1.6",
  boxShadow: "0 12px 35px rgba(33, 28, 25, 0.08)",
};

// ======================================================
// 03. GLOBAL NOTIFICATIONS
// ======================================================

function GlobalNotifications() {
  return (
    <ToastContainer
      position="bottom-right"
      autoClose={3500}
      hideProgressBar
      newestOnTop
      closeOnClick
      pauseOnHover
      pauseOnFocusLoss
      draggable={false}
      theme="light"
      limit={3}
      role="status"
      aria-label="Maison Kiyora notifications"
      toastStyle={toastStyles}
    />
  );
}

// ======================================================
// 04. GLOBAL PROVIDERS
// ======================================================

function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

// ======================================================
// 05. ROOT ELEMENT
// ======================================================

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "Maison Kiyora: Root element #root was not found. Check index.html."
  );
}

// ======================================================
// 06. RENDER APPLICATION
// ======================================================

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <App />
      <GlobalNotifications />
    </AppProviders>
  </StrictMode>
);
