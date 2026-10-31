
/**
 * ======================================================
 * MAISON KIYORA
 * THE ART OF SLOW PERFUMERY
 *
 * SHIPPING SERVICE
 *
 * React 19 + Vite 6
 *
 * RESPONSIBILITIES:
 * - Validate Indian PIN codes
 * - Validate shipping addresses
 * - Check delivery availability
 * - Fetch shipping quotes
 * - Fetch delivery estimates
 * - Fetch shipment tracking
 * - Format shipping prices
 *
 * IMPORTANT:
 * This service does not invent shipping rates,
 * delivery dates, or courier availability.
 *
 * Actual shipping data must come from a
 * trusted backend or courier integration.
 *
 * Backend endpoints expected:
 *
 * GET  /api/shipping/check-pincode
 * POST /api/shipping/quote
 * POST /api/shipping/estimate
 * GET  /api/shipping/track/:orderId
 *
 * These endpoints must be implemented separately.
 * ======================================================
 */

// ======================================================
// 01. CONFIGURATION
// ======================================================

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ""
).replace(/\/+$/, "");

const SHIPPING_API_PATH = "/api/shipping";

const REQUEST_TIMEOUT = 30000;

export const SHIPPING_CURRENCY = "INR";

export const DELIVERY_STATUS = Object.freeze({
  UNKNOWN: "unknown",
  AVAILABLE: "available",
  UNAVAILABLE: "unavailable",
});

export const SHIPMENT_STATUS = Object.freeze({
  PENDING: "pending",
  PROCESSING: "processing",
  PICKED_UP: "picked_up",
  IN_TRANSIT: "in_transit",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  EXCEPTION: "exception",
  RETURNED: "returned",
});

// ======================================================
// 02. CUSTOM ERROR
// ======================================================

export class ShippingServiceError extends Error {
  constructor(
    message,
    code = "SHIPPING_SERVICE_ERROR",
    status = null,
    details = null
  ) {
    super(message);

    this.name = "ShippingServiceError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// ======================================================
// 03. GENERAL HELPERS
// ======================================================

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function normalizeString(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeMoney(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const amount = Number(value);

  return Number.isFinite(amount) &&
    amount >= 0
    ? amount
    : null;
}

function normalizeDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date.toISOString();
}

function getApiUrl(endpoint) {
  if (!API_BASE_URL) {
    throw new ShippingServiceError(
      "Shipping backend is not configured.",
      "BACKEND_NOT_CONFIGURED"
    );
  }

  return `${API_BASE_URL}${endpoint}`;
}

// ======================================================
// 04. CONFIGURATION CHECK
// ======================================================

export function isShippingConfigured() {
  return Boolean(API_BASE_URL);
}

export function getShippingConfiguration() {
  return {
    configured: isShippingConfigured(),
    currency: SHIPPING_CURRENCY,
    country: "India",
  };
}

// ======================================================
// 05. PIN CODE VALIDATION
// ======================================================

/**
 * Validates Indian PIN code format.
 *
 * A valid format does not mean:
 * - The PIN code exists
 * - Delivery is available
 * - Cash on delivery is available
 *
 * Courier/backend verification is required
 * for serviceability.
 */

export function isValidIndianPincode(value) {
  const pincode = String(value ?? "").trim();

  return /^[1-9][0-9]{5}$/.test(pincode);
}

export function normalizePincode(value) {
  return String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, 6);
}

export function validatePincode(value) {
  const pincode = String(value ?? "").trim();

  if (!pincode) {
    return {
      valid: false,
      pincode: "",
      message: "PIN code is required.",
    };
  }

  if (!isValidIndianPincode(pincode)) {
    return {
      valid: false,
      pincode,
      message:
        "Enter a valid 6-digit Indian PIN code.",
    };
  }

  return {
    valid: true,
    pincode,
    message: null,
  };
}

// ======================================================
// 06. ADDRESS VALIDATION
// ======================================================

/**
 * Expected shipping address:
 *
 * {
 *   firstName: "Customer",
 *   lastName: "Name",
 *   phone: "9876543210",
 *   addressLine1: "House / Street",
 *   addressLine2: "",
 *   landmark: "",
 *   city: "Bhopal",
 *   state: "Madhya Pradesh",
 *   postalCode: "462001",
 *   country: "India"
 * }
 *
 * Checkout.jsx currently stores customer
 * name and phone separately. Those details
 * can be passed into this validator when needed.
 */

export function validateShippingAddress(
  address,
  {
    requireRecipient = false,
  } = {}
) {
  const errors = {};

  if (!isPlainObject(address)) {
    return {
      valid: false,
      errors: {
        address:
          "Valid delivery address is required.",
      },
    };
  }

  const firstName = normalizeString(
    address.firstName
  );

  const lastName = normalizeString(
    address.lastName
  );

  const phone = normalizeString(
    address.phone
  );

  const addressLine1 = normalizeString(
    address.addressLine1
  );

  const city = normalizeString(
    address.city
  );

  const state = normalizeString(
    address.state
  );

  const postalCode = normalizeString(
    address.postalCode ??
    address.pincode
  );

  const country = normalizeString(
    address.country || "India"
  );

  if (requireRecipient) {
    if (!firstName) {
      errors.firstName =
        "Recipient first name is required.";
    }

    if (!lastName) {
      errors.lastName =
        "Recipient last name is required.";
    }

    if (!/^[6-9][0-9]{9}$/.test(phone)) {
      errors.phone =
        "Enter a valid 10-digit mobile number.";
    }
  }

  if (!addressLine1) {
    errors.addressLine1 =
      "Street address is required.";
  }

  if (!city) {
    errors.city = "City is required.";
  }

  if (!state) {
    errors.state =
      "State or union territory is required.";
  }

  if (!isValidIndianPincode(postalCode)) {
    errors.postalCode =
      "Enter a valid 6-digit Indian PIN code.";
  }

  if (country.toLowerCase() !== "india") {
    errors.country =
      "Only Indian delivery addresses are supported by this checkout configuration.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ======================================================
// 07. SHIPPING API REQUEST
// ======================================================

async function shippingApiRequest(
  endpoint,
  {
    method = "GET",
    body,
    headers = {},
    signal,
  } = {}
) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT);

  const abortFromExternalSignal = () => {
    controller.abort();
  };

  if (signal?.aborted) {
    controller.abort();
  } else {
    signal?.addEventListener(
      "abort",
      abortFromExternalSignal,
      { once: true }
    );
  }

  try {
    const response = await fetch(
      getApiUrl(endpoint),
      {
        method,

        headers: {
          Accept: "application/json",

          ...(body !== undefined
            ? {
                "Content-Type":
                  "application/json",
              }
            : {}),

          ...headers,
        },

        credentials: "omit",

        ...(body !== undefined
          ? {
              body: JSON.stringify(body),
            }
          : {}),

        signal: controller.signal,
      }
    );

    const contentType =
      response.headers.get("content-type") ||
      "";

    let data = null;

    if (contentType.includes("application/json")) {
      try {
        data = await response.json();
      } catch {
        throw new ShippingServiceError(
          "Shipping server returned invalid JSON.",
          "INVALID_JSON_RESPONSE",
          response.status
        );
      }
    }

    if (!response.ok) {
      throw new ShippingServiceError(
        data?.message ||
          data?.error?.message ||
          "Shipping request could not be completed.",
        data?.code ||
          "SHIPPING_API_ERROR",
        response.status,
        data
      );
    }

    if (
      data === null ||
      typeof data !== "object"
    ) {
      throw new ShippingServiceError(
        "Shipping server returned an invalid response.",
        "INVALID_SERVER_RESPONSE",
        response.status
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ShippingServiceError) {
      throw error;
    }

    if (error?.name === "AbortError") {
      throw new ShippingServiceError(
        signal?.aborted
          ? "Shipping request was cancelled."
          : "Shipping request timed out.",
        signal?.aborted
          ? "REQUEST_CANCELLED"
          : "REQUEST_TIMEOUT"
      );
    }

    throw new ShippingServiceError(
      "Unable to connect to the shipping server. Please try again.",
      "NETWORK_ERROR"
    );
  } finally {
    clearTimeout(timeout);

    signal?.removeEventListener(
      "abort",
      abortFromExternalSignal
    );
  }
}

// ======================================================
// 08. CHECK PIN CODE SERVICEABILITY
// ======================================================

/**
 * GET /api/shipping/check-pincode?pincode=462001
 *
 * Expected response:
 *
 * {
 *   pincode: "462001",
 *   serviceable: true,
 *   message: "Delivery available"
 * }
 *
 * Backend must check actual courier coverage.
 *
 * No hardcoded PIN code serviceability.
 */

export async function checkPincodeServiceability(
  pincode,
  options = {}
) {
  const validation = validatePincode(pincode);

  if (!validation.valid) {
    throw new ShippingServiceError(
      validation.message,
      "INVALID_PINCODE"
    );
  }

  const params = new URLSearchParams({
    pincode: validation.pincode,
  });

  const data = await shippingApiRequest(
    `${SHIPPING_API_PATH}/check-pincode?${params.toString()}`,
    options
  );

  const result = data?.data ?? data;

  if (
    !isPlainObject(result) ||
    typeof result.serviceable !== "boolean"
  ) {
    throw new ShippingServiceError(
      "Delivery availability could not be confirmed.",
      "INVALID_SERVICEABILITY_RESPONSE"
    );
  }

  if (
    result.pincode &&
    String(result.pincode) !== validation.pincode
  ) {
    throw new ShippingServiceError(
      "Shipping server returned a different PIN code.",
      "PINCODE_MISMATCH"
    );
  }

  return {
    pincode: validation.pincode,

    serviceable: result.serviceable,

    status: result.serviceable
      ? DELIVERY_STATUS.AVAILABLE
      : DELIVERY_STATUS.UNAVAILABLE,

    message:
      result.message ??
      (result.serviceable
        ? "Delivery is available for this PIN code."
        : "Delivery is not available for this PIN code."),
  };
}

// ======================================================
// 09. VALIDATE CART FOR SHIPPING REQUEST
// ======================================================

function normalizeShippingItems(items) {
  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    throw new ShippingServiceError(
      "At least one product is required.",
      "EMPTY_SHIPPING_ITEMS"
    );
  }

  return items.map((item) => {
    const productId =
      item?.productId ??
      item?.id;

    const quantity = Number(
      item?.quantity
    );

    if (
      !productId ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1 ||
      quantity > 10
    ) {
      throw new ShippingServiceError(
        "Invalid product details for shipping.",
        "INVALID_SHIPPING_ITEM"
      );
    }

    return {
      productId,
      variantId:
        item?.variantId ??
        "default",
      quantity,
    };
  });
}

// ======================================================
// 10. GET SHIPPING QUOTE
// ======================================================

/**
 * POST /api/shipping/quote
 *
 * Request:
 *
 * {
 *   items: [
 *     {
 *       productId: "perfume-id",
 *       variantId: "default",
 *       quantity: 1
 *     }
 *   ],
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
 *   serviceable: true,
 *   shippingAmount: 80,
 *   currency: "INR",
 *   estimatedDeliveryDate: "2026-11-05",
 *   shippingMethod: "standard"
 * }
 *
 * Monetary values are in INR major units.
 * Razorpay payment amounts are in paise.
 *
 * Final payment amount must be calculated
 * again by the backend during order creation.
 */

export async function getShippingQuote(
  {
    items,
    shippingAddress,
  } = {},
  options = {}
) {
  const normalizedItems =
    normalizeShippingItems(items);

  const addressValidation =
    validateShippingAddress(shippingAddress);

  if (!addressValidation.valid) {
    throw new ShippingServiceError(
      "Please enter a valid shipping address.",
      "INVALID_SHIPPING_ADDRESS",
      null,
      addressValidation.errors
    );
  }

  const data = await shippingApiRequest(
    `${SHIPPING_API_PATH}/quote`,
    {
      method: "POST",

      body: {
        items: normalizedItems,
        shippingAddress,
      },

      ...options,
    }
  );

  const result = data?.data ?? data;

  if (
    !isPlainObject(result) ||
    typeof result.serviceable !== "boolean"
  ) {
    throw new ShippingServiceError(
      "Invalid shipping quote received.",
      "INVALID_SHIPPING_QUOTE"
    );
  }

  const shippingAmount =
    normalizeMoney(
      result.shippingAmount ??
      result.shipping_amount
    );

  const currency = result.currency;

  if (
    result.serviceable &&
    (shippingAmount === null ||
      currency !== "INR")
  ) {
    throw new ShippingServiceError(
      "Shipping charges could not be confirmed.",
      "INCOMPLETE_SHIPPING_QUOTE"
    );
  }

  return {
    serviceable: result.serviceable,

    status: result.serviceable
      ? DELIVERY_STATUS.AVAILABLE
      : DELIVERY_STATUS.UNAVAILABLE,

    shippingAmount: result.serviceable
      ? shippingAmount
      : null,

    currency:
      currency === "INR"
        ? "INR"
        : null,

    shippingMethod:
      result.shippingMethod ??
      result.shipping_method ??
      null,

    estimatedDeliveryDate:
      normalizeDate(
        result.estimatedDeliveryDate ??
        result.estimated_delivery_date
      ),

    message:
      result.message ??
      null,
  };
}

// ======================================================
// 11. GET DELIVERY ESTIMATE
// ======================================================

/**
 * POST /api/shipping/estimate
 *
 * Expected response:
 *
 * {
 *   serviceable: true,
 *   estimatedMinDays: 3,
 *   estimatedMaxDays: 7,
 *   estimatedDeliveryDate: "2026-11-05"
 * }
 *
 * Dates and transit times must come
 * from backend/courier data.
 */

export async function getDeliveryEstimate(
  {
    pincode,
    items,
  } = {},
  options = {}
) {
  const validation =
    validatePincode(pincode);

  if (!validation.valid) {
    throw new ShippingServiceError(
      validation.message,
      "INVALID_PINCODE"
    );
  }

  const normalizedItems =
    normalizeShippingItems(items);

  const data = await shippingApiRequest(
    `${SHIPPING_API_PATH}/estimate`,
    {
      method: "POST",

      body: {
        pincode: validation.pincode,
        items: normalizedItems,
      },

      ...options,
    }
  );

  const result = data?.data ?? data;

  if (
    !isPlainObject(result) ||
    typeof result.serviceable !== "boolean"
  ) {
    throw new ShippingServiceError(
      "Delivery estimate could not be confirmed.",
      "INVALID_DELIVERY_ESTIMATE"
    );
  }

  const minDays = Number(
    result.estimatedMinDays ??
    result.estimated_min_days
  );

  const maxDays = Number(
    result.estimatedMaxDays ??
    result.estimated_max_days
  );

  return {
    pincode: validation.pincode,

    serviceable: result.serviceable,

    status: result.serviceable
      ? DELIVERY_STATUS.AVAILABLE
      : DELIVERY_STATUS.UNAVAILABLE,

    estimatedMinDays:
      Number.isSafeInteger(minDays) &&
      minDays >= 0
        ? minDays
        : null,

    estimatedMaxDays:
      Number.isSafeInteger(maxDays) &&
      maxDays >= 0
        ? maxDays
        : null,

    estimatedDeliveryDate:
      normalizeDate(
        result.estimatedDeliveryDate ??
        result.estimated_delivery_date
      ),

    message: result.message ?? null,
  };
}

// ======================================================
// 12. GET SHIPMENT TRACKING
// ======================================================

/**
 * GET /api/shipping/track/:orderId
 *
 * Backend must verify that the user
 * owns the requested order.
 *
 * Expected response:
 *
 * {
 *   orderId: "order-uuid",
 *   trackingNumber: "TRACK123",
 *   courier: "Courier Name",
 *   status: "in_transit",
 *   trackingUrl: "https://...",
 *   estimatedDeliveryDate: "2026-11-05",
 *   events: []
 * }
 */

export async function getShipmentTracking(
  orderId,
  options = {}
) {
  if (
    typeof orderId !== "string" ||
    !orderId.trim() ||
    orderId.trim().length > 200
  ) {
    throw new ShippingServiceError(
      "A valid order ID is required.",
      "INVALID_ORDER_ID"
    );
  }

  const encodedOrderId =
    encodeURIComponent(orderId.trim());

  const data = await shippingApiRequest(
    `${SHIPPING_API_PATH}/track/${encodedOrderId}`,
    options
  );

  const result = data?.data ?? data;

  if (!isPlainObject(result)) {
    throw new ShippingServiceError(
      "Invalid shipment tracking response.",
      "INVALID_TRACKING_RESPONSE"
    );
  }

  const events = Array.isArray(result.events)
    ? result.events
        .filter(isPlainObject)
        .map((event) => ({
          status:
            normalizeString(event.status) ||
            "unknown",

          description:
            normalizeString(
              event.description ??
              event.message
            ),

          location:
            normalizeString(event.location) ||
            null,

          timestamp:
            normalizeDate(
              event.timestamp ??
              event.createdAt ??
              event.created_at
            ),
        }))
    : [];

  return {
    orderId:
      result.orderId ??
      result.order_id ??
      orderId,

    trackingNumber:
      result.trackingNumber ??
      result.tracking_number ??
      null,

    courier:
      result.courier ??
      null,

    status:
      normalizeString(result.status)
        .toLowerCase() ||
      SHIPMENT_STATUS.PENDING,

    trackingUrl:
      result.trackingUrl ??
      result.tracking_url ??
      null,

    estimatedDeliveryDate:
      normalizeDate(
        result.estimatedDeliveryDate ??
        result.estimated_delivery_date
      ),

    deliveredAt:
      normalizeDate(
        result.deliveredAt ??
        result.delivered_at
      ),

    events,
  };
}

// ======================================================
// 13. FORMAT SHIPPING PRICE
// ======================================================

export function formatShippingPrice(
  amount,
  currency = "INR"
) {
  const normalized =
    normalizeMoney(amount);

  if (normalized === null) {
    return "Calculated at checkout";
  }

  if (normalized === 0) {
    return "Free";
  }

  try {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }
    ).format(normalized);
  } catch {
    return "Shipping charge unavailable";
  }
}

// ======================================================
// 14. FORMAT DELIVERY DATE
// ======================================================

export function formatDeliveryDate(value) {
  if (!value) {
    return "To be confirmed";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "To be confirmed";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }
  ).format(date);
}

// ======================================================
// 15. DELIVERY STATUS LABEL
// ======================================================

export function getDeliveryStatusLabel(status) {
  switch (status) {
    case DELIVERY_STATUS.AVAILABLE:
      return "Delivery Available";

    case DELIVERY_STATUS.UNAVAILABLE:
      return "Delivery Unavailable";

    default:
      return "Delivery Not Confirmed";
  }
}

// ======================================================
// 16. SHIPMENT STATUS LABEL
// ======================================================

const SHIPMENT_STATUS_LABELS = {
  pending: "Pending",
  processing: "Processing",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  exception: "Delivery Exception",
  returned: "Returned",
};

export function getShipmentStatusLabel(status) {
  return (
    SHIPMENT_STATUS_LABELS[
      normalizeString(status).toLowerCase()
    ] || "Status Unavailable"
  );
}

// ======================================================
// 17. ERROR MESSAGE HELPER
// ======================================================

export function getShippingErrorMessage(error) {
  if (error instanceof ShippingServiceError) {
    return error.message;
  }

  return (
    error?.message ||
    "Unable to retrieve shipping information."
  );
}

// ======================================================
// 18. DEFAULT EXPORT
// ======================================================

const shippingService = {
  isShippingConfigured,
  getShippingConfiguration,

  isValidIndianPincode,
  normalizePincode,
  validatePincode,
  validateShippingAddress,

  checkPincodeServiceability,
  getShippingQuote,
  getDeliveryEstimate,
  getShipmentTracking,

  formatShippingPrice,
  formatDeliveryDate,

  getDeliveryStatusLabel,
  getShipmentStatusLabel,

  getShippingErrorMessage,
};

export default shippingService;
