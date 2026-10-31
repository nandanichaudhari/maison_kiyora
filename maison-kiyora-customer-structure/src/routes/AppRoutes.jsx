
import { lazy, Suspense } from "react";

import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

// ======================================================
// MAISON KIYORA
// THE ART OF SLOW PERFUMERY
//
// CUSTOMER STOREFRONT ROUTES
// React 19 + Vite + React Router
// ======================================================

// ======================================================
// 01. STOREFRONT PAGES
// ======================================================

const Home = lazy(() =>
  import("../pages/Home.jsx")
);

const Collections = lazy(() =>
  import("../pages/Collections.jsx")
);

const CollectionDetails = lazy(() =>
  import("../pages/CollectionDetails.jsx")
);

const ProductDetails = lazy(() =>
  import("../pages/ProductDetails.jsx")
);

const Search = lazy(() =>
  import("../pages/Search.jsx")
);

const Wishlist = lazy(() =>
  import("../pages/Wishlist.jsx")
);

const Cart = lazy(() =>
  import("../pages/Cart.jsx")
);

const Checkout = lazy(() =>
  import("../pages/Checkout.jsx")
);

const CheckoutSuccess = lazy(() =>
  import("../pages/CheckoutSuccess.jsx")
);

// ======================================================
// 02. AUTHENTICATION PAGES
// ======================================================

const Login = lazy(() =>
  import("../pages/Login.jsx")
);

const Register = lazy(() =>
  import("../pages/Register.jsx")
);

const ForgotPassword = lazy(() =>
  import("../pages/ForgotPassword.jsx")
);

const ResetPassword = lazy(() =>
  import("../pages/ResetPassword.jsx")
);

// ======================================================
// 03. CUSTOMER ACCOUNT PAGES
// ======================================================

const Account = lazy(() =>
  import("../pages/Account.jsx")
);

const Addresses = lazy(() =>
  import("../pages/Addresses.jsx")
);

const Orders = lazy(() =>
  import("../pages/Orders.jsx")
);

const OrderDetails = lazy(() =>
  import("../pages/OrderDetails.jsx")
);

// ======================================================
// 04. BRAND & SUPPORT PAGES
// ======================================================

const OurStory = lazy(() =>
  import("../pages/OurStory.jsx")
);

const Contact = lazy(() =>
  import("../pages/Contact.jsx")
);

const ShippingPolicy = lazy(() =>
  import("../pages/ShippingPolicy.jsx")
);

const ReturnsRefunds = lazy(() =>
  import("../pages/ReturnsRefunds.jsx")
);

const PrivacyPolicy = lazy(() =>
  import("../pages/PrivacyPolicy.jsx")
);

const Terms = lazy(() =>
  import("../pages/Terms.jsx")
);

const NotFound = lazy(() =>
  import("../pages/NotFound.jsx")
);

// ======================================================
// 05. LUXURY LOADING SCREEN
// ======================================================

function PageLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading page"
      style={{
        minHeight: "55vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "14px",
        padding: "40px 24px",
        background: "#F5F0E8",
        color: "#211C19",
        textAlign: "center",
      }}
    >
      <span
        style={{
          fontFamily:
            '"Cormorant Garamond", Georgia, serif',
          fontSize: "clamp(26px, 5vw, 34px)",
          fontWeight: 400,
          letterSpacing: "0.13em",
          lineHeight: 1.2,
        }}
      >
        MAISON KIYORA
      </span>

      <span
        aria-hidden="true"
        style={{
          width: "45px",
          height: "1px",
          background: "#B69A69",
        }}
      />

      <span
        style={{
          fontFamily:
            '"Manrope", Arial, sans-serif',
          fontSize: "10px",
          fontWeight: 500,
          letterSpacing: "0.18em",
          color: "#967A51",
        }}
      >
        LOADING YOUR EXPERIENCE…
      </span>
    </div>
  );
}

// ======================================================
// 06. PROTECTED CUSTOMER ROUTES
// ======================================================

function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoading />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
          },
        }}
      />
    );
  }

  return <Outlet />;
}

// ======================================================
// 07. GUEST-ONLY AUTH ROUTES
// ======================================================

function GuestRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PageLoading />;
  }

  if (isAuthenticated) {
    const requestedPath = location.state?.from;

    const redirectTo =
      requestedPath &&
      typeof requestedPath.pathname === "string" &&
      requestedPath.pathname.startsWith("/") &&
      !requestedPath.pathname.startsWith("//")
        ? requestedPath
        : "/account";

    return (
      <Navigate
        to={redirectTo}
        replace
      />
    );
  }

  return children;
}

// ======================================================
// 08. APPLICATION ROUTES
// ======================================================

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        {/* HOME */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* SHOP */}

        <Route
          path="/shop"
          element={
            <Navigate
              to="/collections"
              replace
            />
          }
        />

        <Route
          path="/collections"
          element={<Collections />}
        />

        <Route
          path="/collections/:slug"
          element={<CollectionDetails />}
        />

        <Route
          path="/product/:slug"
          element={<ProductDetails />}
        />

        <Route
          path="/search"
          element={<Search />}
        />

        {/* WISHLIST */}

        <Route
          path="/wishlist"
          element={<Wishlist />}
        />

        {/* CART */}

        <Route
          path="/cart"
          element={<Cart />}
        />

        {/* CHECKOUT */}

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/checkout/success"
          element={<CheckoutSuccess />}
        />

        {/* AUTHENTICATION */}

        <Route
          path="/login"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />

        <Route
          path="/register"
          element={
            <GuestRoute>
              <Register />
            </GuestRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <GuestRoute>
              <ForgotPassword />
            </GuestRoute>
          }
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* PROTECTED ACCOUNT ROUTES */}

        <Route element={<ProtectedRoute />}>
          <Route
            path="/account"
            element={<Account />}
          />

          <Route
            path="/account/addresses"
            element={<Addresses />}
          />

          <Route
            path="/orders"
            element={<Orders />}
          />

          <Route
            path="/orders/:orderId"
            element={<OrderDetails />}
          />

          <Route
            path="/account/orders"
            element={
              <Navigate
                to="/orders"
                replace
              />
            }
          />

          <Route
            path="/account/orders/:orderId"
            element={<OrderDetails />}
          />
        </Route>

        {/* BRAND */}

        <Route
          path="/our-story"
          element={<OurStory />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        {/* POLICIES */}

        <Route
          path="/shipping-policy"
          element={<ShippingPolicy />}
        />

        <Route
          path="/returns-refunds"
          element={<ReturnsRefunds />}
        />

        <Route
          path="/return-policy"
          element={
            <Navigate
              to="/returns-refunds"
              replace
            />
          }
        />

        <Route
          path="/privacy-policy"
          element={<PrivacyPolicy />}
        />

        <Route
          path="/terms"
          element={<Terms />}
        />

        {/* 404 */}

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </Suspense>
  );
}
