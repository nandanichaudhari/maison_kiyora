
/**
 * ======================================================
 * MAISON KIYORA
 * THE ART OF SLOW PERFUMERY
 *
 * RAZORPAY PAYMENT SERVICE
 *
 * React 19 + Vite 6
 *
 * RESPONSIBILITIES:
 * - Load Razorpay Checkout SDK
 * - Request payment order from backend
 * - Open Razorpay Checkout
 * - Verify payment through backend
 * - Handle cancellation and errors
 * - Return verified payment results
 *
 * SECURITY:
 * - Never expose Razorpay key_secret
 * - Never calculate trusted amounts in frontend
 * - Never verify signatures in frontend
 * - Never mark an order paid without backend verification
 *
 * Backend endpoints expected:
 *
 * POST /api/payments/create-order
 * POST /api/payments/verify
 *
 * Both endpoints must be implemented separately.
 * ======================================================
 */

// ======================================================
// 01. CONFIGURATION
// ======================================================

const RAZORPAY_SCRIPT_URL =
  "https://checkout.razorpay.com/v1/checkout.js";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ""
).replace(/\/+$/, "");

const RAZORPAY_KEY_ID =
  import.meta.env.VITE_RAZORPAY_KEY_ID || "";

const REQUEST_TIMEOUT = 30000;

// ======================================================
// 02. CUSTOM PAYMENT ERROR
// ======================================================

export class PaymentError extends Error {
  constructor(
    message,
    code = "PAYMENT_ERROR",
    details = null
  ) {
    super(message);

    this.name = "PaymentError";
    this.code = code;
    this.details = details;
  }
}

// ======================================================
// 03. ENVIRONMENT VALIDATION
// ======================================================

export function isPaymentConfigured() {
  return Boolean(
    API_BASE_URL &&
    RAZORPAY_KEY_ID
  );
}

export function getPaymentConfiguration() {
  return {
    configured: isPaymentConfigured(),
    provider: "razorpay",
    currency: "INR",
  };
}

// ======================================================
// 04. LOAD RAZORPAY SDK
// ======================================================

let razorpayScriptPromise = null;

export function loadRazorpayScript() {
  if (typeof window === "undefined") {
    return Promise.reject(
      new PaymentError(
        "Razorpay Checkout requires a browser.",
        "BROWSER_REQUIRED"
      )
    );
  }

  if (typeof window.Razorpay === "function") {
    return Promise.resolve(true);
  }

  if (razorpayScriptPromise) {
    return razorpayScriptPromise;
  }

  razorpayScriptPromise = new Promise(
    (resolve, reject) => {
      const existingScript =
        document.querySelector(
          `script[src="${RAZORPAY_SCRIPT_URL}"]`
        );

      const script =
        existingScript ||
        document.createElement("script");

      let settled = false;

      const cleanup = () => {
        script.removeEventListener(
          "load",
          handleLoad
        );

        script.removeEventListener(
          "error",
          handleError
        );
      };

      const handleLoad = () => {
        if (settled) return;

        settled = true;
        cleanup();

        if (
          typeof window.Razorpay === "function"
        ) {
          resolve(true);
        } else {
          razorpayScriptPromise = null;

          reject(
            new PaymentError(
              "Razorpay Checkout could not be initialized.",
              "SDK_INITIALIZATION_FAILED"
            )
          );
        }
      };

      const handleError = () => {
        if (settled) return;

        settled = true;
        cleanup();

        razorpayScriptPromise = null;

        reject(
          new PaymentError(
            "Unable to load the payment gateway. Please try again.",
            "SDK_LOAD_FAILED"
          )
        );
      };

      script.addEventListener(
        "load",
        handleLoad
      );

      script.addEventListener(
        "error",
        handleError
      );

      if (!existingScript) {
        script.src = RAZORPAY_SCRIPT_URL;
        script.async = true;

        document.body.appendChild(script);
      } else if (
        typeof window.Razorpay === "function"
      ) {
        handleLoad();
      }
    }
  );

  return razorpayScriptPromise;
}

// ======================================================
// 05. BACKEND API HELPER
// ======================================================

async function paymentApiRequest(
  endpoint,
  payload,
  options = {}
) {
  if (!API_BASE_URL) {
    throw new PaymentError(
      "Payment backend is not configured.",
      "BACKEND_NOT_CONFIGURED"
    );
  }

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT);

  const externalSignal = options.signal;

  const abortFromExternalSignal = () => {
    controller.abort();
  };

  if (externalSignal?.aborted) {
    controller.abort();
  } else {
    externalSignal?.addEventListener(
      "abort",
      abortFromExternalSignal,
      { once: true }
    );
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}${endpoint}`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(options.headers || {}),
        },

        credentials: "omit",

        body: JSON.stringify(payload),

        signal: controller.signal,
      }
    );

    const contentType =
      response.headers.get("content-type") ||
      "";

    const data = contentType.includes(
      "application/json"
    )
      ? await response.json()
      : null;

    if (!response.ok) {
      throw new PaymentError(
        data?.message ||
          "The payment request could not be completed.",
        data?.code || "PAYMENT_API_ERROR",
        {
          status: response.status,
        }
      );
    }

    if (!data || typeof data !== "object") {
      throw new PaymentError(
        "Invalid response from payment server.",
        "INVALID_SERVER_RESPONSE"
      );
    }

    return data;
  } catch (error) {
    if (error instanceof PaymentError) {
      throw error;
    }

    if (error?.name === "AbortError") {
      throw new PaymentError(
        "The payment request was interrupted or timed out.",
        "REQUEST_ABORTED"
      );
    }

    throw new PaymentError(
      "Unable to connect to the payment server. Please check your connection.",
      "NETWORK_ERROR"
    );
  } finally {
    clearTimeout(timeout);

    externalSignal?.removeEventListener(
      "abort",
      abortFromExternalSignal
    );
  }
}

// ======================================================
// 06. CREATE PAYMENT ORDER
// ======================================================

/**
 * Request a Razorpay order from the backend.
 *
 * Expected request:
 *
 * {
 *   items: [
 *     {
 *       productId: "product-id",
 *       variantId: "default",
 *       quantity: 1
 *     }
 *   ],
 *   customer: {
 *     firstName: "...",
 *     lastName: "...",
 *     email: "...",
 *     phone: "..."
 *   },
 *   shippingAddress: {
 *     addressLine1: "...",
 *     city: "...",
 *     state: "...",
 *     postalCode: "...",
 *     country: "India"
 *   }
 * }
 *
 * Expected response:
 *
 * {
 *   orderId: "internal-order-id",
 *   razorpayOrderId: "order_xxxxx",
 *   amount: 295000,
 *   currency: "INR",
 *   keyId: "rzp_test_xxxxx"
 * }
 *
 * amount must be in paise.
 *
 * Backend must:
 * - Validate product IDs and quantities
 * - Read prices from trusted database
 * - Calculate final payable amount
 * - Check shipping availability
 * - Create internal pending order
 * - Create Razorpay order
 */

export async function createPaymentOrder(
  checkoutData,
  options = {}
) {
  if (
    !checkoutData ||
    typeof checkoutData !== "object"
  ) {
    throw new PaymentError(
      "Valid checkout details are required.",
      "INVALID_CHECKOUT_DATA"
    );
  }

  if (
    !Array.isArray(checkoutData.items) ||
    checkoutData.items.length === 0
  ) {
    throw new PaymentError(
      "Your shopping bag is empty.",
      "EMPTY_CART"
    );
  }

  const data = await paymentApiRequest(
    "/api/payments/create-order",
    checkoutData,
    options
  );

  const razorpayOrderId =
    data.razorpayOrderId ||
    data.razorpay_order_id;

  const internalOrderId =
    data.orderId ||
    data.internalOrderId;

  const amount = Number(data.amount);

  const currency = data.currency;

  if (
    !internalOrderId ||
    typeof internalOrderId !== "string" ||
    !razorpayOrderId ||
    typeof razorpayOrderId !== "string" ||
    !razorpayOrderId.startsWith("order_") ||
    !Number.isSafeInteger(amount) ||
    amount <= 0 ||
    currency !== "INR"
  ) {
    throw new PaymentError(
      "Payment server returned incomplete order details.",
      "INVALID_ORDER_RESPONSE"
    );
  }

  return {
    orderId: internalOrderId,
    razorpayOrderId,
    amount,
    currency,
    keyId: data.keyId || RAZORPAY_KEY_ID,
  };
}

// ======================================================
// 07. VERIFY PAYMENT
// ======================================================

/**
 * Backend verification request:
 *
 * {
 *   orderId: "internal-order-id",
 *   razorpay_order_id: "order_xxxxx",
 *   razorpay_payment_id: "pay_xxxxx",
 *   razorpay_signature: "..."
 * }
 *
 * Backend must:
 * - Authenticate/authorize the request as needed
 * - Look up its stored Razorpay order ID
 * - Verify Razorpay payment signature
 * - Check payment amount and currency
 * - Confirm payment status with Razorpay
 * - Update internal order idempotently
 *
 * Expected response:
 *
 * {
 *   verified: true,
 *   orderId: "internal-order-id",
 *   paymentStatus: "paid"
 * }
 */

export async function verifyPayment(
  paymentData,
  options = {}
) {
  const {
    orderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = paymentData || {};

  if (
    !orderId ||
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    throw new PaymentError(
      "Incomplete payment verification details.",
      "INVALID_VERIFICATION_DATA"
    );
  }

  const result = await paymentApiRequest(
    "/api/payments/verify",
    {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    },
    options
  );

  if (
    result.verified !== true ||
    result.paymentStatus !== "paid" ||
    result.orderId !== orderId
  ) {
    throw new PaymentError(
      "Payment could not be confirmed. Please check your order status before retrying.",
      "PAYMENT_NOT_VERIFIED"
    );
  }

  return result;
}

// ======================================================
// 08. OPEN RAZORPAY CHECKOUT
// ======================================================

export async function openRazorpayCheckout({
  order,
  customer = {},
  onPaymentAttempt,
} = {}) {
  if (!order) {
    throw new PaymentError(
      "A valid payment order is required.",
      "ORDER_REQUIRED"
    );
  }

  if (!isPaymentConfigured()) {
    throw new PaymentError(
      "Online payments are not configured yet.",
      "PAYMENT_NOT_CONFIGURED"
    );
  }

  await loadRazorpayScript();

  if (
    typeof window.Razorpay !== "function"
  ) {
    throw new PaymentError(
      "Payment gateway is unavailable.",
      "SDK_UNAVAILABLE"
    );
  }

  return new Promise((resolve, reject) => {
    let settled = false;

    const resolveOnce = (value) => {
      if (settled) return;

      settled = true;
      resolve(value);
    };

    const rejectOnce = (error) => {
      if (settled) return;

      settled = true;
      reject(error);
    };

    const options = {
      key: order.keyId || RAZORPAY_KEY_ID,

      amount: order.amount,
      currency: order.currency,

      name: "Maison Kiyora",
      description: "Fragrance Order",

      order_id: order.razorpayOrderId,

      prefill: {
        name: [
          customer.firstName,
          customer.lastName,
        ]
          .filter(Boolean)
          .join(" "),

        email: customer.email || "",
        contact: customer.phone || "",
      },

      theme: {
        color: "#1D2940",
        backdrop_color: "#211C19",
      },

      modal: {
        confirm_close: true,

        ondismiss: () => {
          rejectOnce(
            new PaymentError(
              "Payment checkout was closed.",
              "PAYMENT_CANCELLED"
            )
          );
        },
      },

      handler: (response) => {
        if (
          !response?.razorpay_payment_id ||
          !response?.razorpay_order_id ||
          !response?.razorpay_signature
        ) {
          rejectOnce(
            new PaymentError(
              "Incomplete payment response received.",
              "INVALID_PAYMENT_RESPONSE"
            )
          );

          return;
        }

        try {
          onPaymentAttempt?.(response);
        } catch {
          // Observational callback errors must not
          // interfere with payment verification.
        }

        resolveOnce(response);
      },
    };

    try {
      const instance =
        new window.Razorpay(options);

      instance.on(
        "payment.failed",
        (response) => {
          rejectOnce(
            new PaymentError(
              response?.error?.description ||
                "Payment attempt failed. Please check the payment status before trying again.",
              "PAYMENT_FAILED",
              response?.error || null
            )
          );
        }
      );

      instance.open();
    } catch (error) {
      rejectOnce(
        new PaymentError(
          "Unable to open the payment window.",
          "CHECKOUT_OPEN_FAILED"
        )
      );
    }
  });
}

// ======================================================
// 09. COMPLETE PAYMENT FLOW
// ======================================================

/**
 * Orchestrates:
 *
 * 1. Backend order creation
 * 2. Razorpay Checkout
 * 3. Backend payment verification
 *
 * Returns a result only after successful verification.
 *
 * Does not:
 * - Clear the shopping bag
 * - Navigate to success page
 * - Save order in localStorage
 *
 * Caller handles navigation only after verification.
 */

export async function processPayment({
  items,
  customer,
  shippingAddress,
  onOrderCreated,
  onPaymentAttempt,
  headers,
} = {}) {
  if (!isPaymentConfigured()) {
    throw new PaymentError(
      "Online payments are not available yet.",
      "PAYMENT_NOT_CONFIGURED"
    );
  }

  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    throw new PaymentError(
      "Add a fragrance to your bag before checkout.",
      "EMPTY_CART"
    );
  }

  // Only identifiers and quantities are sent.
  // Prices from the browser are not trusted.

  const normalizedItems = items.map(
    (item) => ({
      productId:
        item.productId || item.id,

      variantId:
        item.variantId || "default",

      quantity: Number(item.quantity),
    })
  );

  const invalidItem = normalizedItems.some(
    (item) =>
      !item.productId ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 10
  );

  if (invalidItem) {
    throw new PaymentError(
      "Your shopping bag contains invalid product details.",
      "INVALID_CART_ITEMS"
    );
  }

  // STEP 1: CREATE PENDING ORDER

  const order = await createPaymentOrder(
    {
      items: normalizedItems,
      customer,
      shippingAddress,
    },
    { headers }
  );

  onOrderCreated?.(order);

  // STEP 2: OPEN PAYMENT WINDOW

  const paymentResponse =
    await openRazorpayCheckout({
      order,
      customer,
      onPaymentAttempt,
    });

  // STEP 3: VERIFY PAYMENT ON SERVER

  const verification = await verifyPayment(
    {
      orderId: order.orderId,

      razorpay_order_id:
        paymentResponse.razorpay_order_id,

      razorpay_payment_id:
        paymentResponse.razorpay_payment_id,

      razorpay_signature:
        paymentResponse.razorpay_signature,
    },
    { headers }
  );

  // STEP 4: RETURN VERIFIED RESULT

  return {
    success: true,
    verified: true,

    orderId: verification.orderId,

    razorpayOrderId:
      paymentResponse.razorpay_order_id,

    razorpayPaymentId:
      paymentResponse.razorpay_payment_id,

    paymentStatus:
      verification.paymentStatus,
  };
}

// ======================================================
// 10. ERROR MESSAGE HELPER
// ======================================================

export function getPaymentErrorMessage(error) {
  if (error instanceof PaymentError) {
    return error.message;
  }

  return (
    error?.message ||
    "Something went wrong during payment."
  );
}

// ======================================================
// 11. DEFAULT EXPORT
// ======================================================

const paymentService = {
  isPaymentConfigured,
  getPaymentConfiguration,
  loadRazorpayScript,
  createPaymentOrder,
  verifyPayment,
  openRazorpayCheckout,
  processPayment,
  getPaymentErrorMessage,
};

export default paymentService;
