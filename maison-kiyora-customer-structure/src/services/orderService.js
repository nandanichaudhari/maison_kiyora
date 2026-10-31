
/**
 * ======================================================
 * MAISON KIYORA
 * THE ART OF SLOW PERFUMERY
 *
 * CUSTOMER ORDER SERVICE
 *
 * React 19 + Vite 6
 *
 * RESPONSIBILITIES:
 * - Fetch customer orders
 * - Fetch individual order details
 * - Fetch payment and fulfillment status
 * - Submit order cancellation requests
 * - Create orders through backend when required
 * - Normalize API responses
 * - Handle network and API errors
 *
 * SECURITY:
 * - Never trust frontend product prices
 * - Never mark an order paid in the browser
 * - Never expose backend credentials
 * - Never allow client-controlled order ownership
 * - Backend must authorize every order operation
 *
 * This file requires real backend endpoints.
 * It does not create mock orders.
 * ======================================================
 */

// ======================================================
// 01. CONFIGURATION
// ======================================================

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || ""
).replace(/\/+$/, "");

const REQUEST_TIMEOUT = 30000;

const ORDER_API_PATH = "/api/orders";

// ======================================================
// 02. ORDER STATUS CONSTANTS
// ======================================================

export const ORDER_STATUS = Object.freeze({
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  RETURN_REQUESTED: "return_requested",
  RETURNED: "returned",
});

export const PAYMENT_STATUS = Object.freeze({
  PENDING: "pending",
  AUTHORIZED: "authorized",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
  PARTIALLY_REFUNDED: "partially_refunded",
});

export const CANCELLATION_STATUS = Object.freeze({
  REQUESTED: "requested",
  APPROVED: "approved",
  REJECTED: "rejected",
});

// ======================================================
// 03. CUSTOM ERROR CLASS
// ======================================================

export class OrderServiceError extends Error {
  constructor(
    message,
    code = "ORDER_SERVICE_ERROR",
    status = null,
    details = null
  ) {
    super(message);

    this.name = "OrderServiceError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// ======================================================
// 04. HELPERS
// ======================================================

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function isValidOrderId(orderId) {
  return (
    typeof orderId === "string" &&
    orderId.trim().length > 0 &&
    orderId.trim().length <= 200
  );
}

function normalizeOrderId(orderId) {
  if (!isValidOrderId(orderId)) {
    throw new OrderServiceError(
      "A valid order ID is required.",
      "INVALID_ORDER_ID"
    );
  }

  return encodeURIComponent(orderId.trim());
}

function normalizeAmount(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}

function normalizeStatus(value, fallback = "unknown") {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return fallback;
  }

  return value.trim().toLowerCase();
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
    throw new OrderServiceError(
      "Order backend is not configured.",
      "BACKEND_NOT_CONFIGURED"
    );
  }

  return `${API_BASE_URL}${endpoint}`;
}

// ======================================================
// 05. CONFIGURATION CHECK
// ======================================================

export function isOrderServiceConfigured() {
  return Boolean(API_BASE_URL);
}

export function getOrderServiceConfiguration() {
  return {
    configured: isOrderServiceConfigured(),
    apiBaseUrlConfigured: Boolean(API_BASE_URL),
  };
}

// ======================================================
// 06. API REQUEST HELPER
// ======================================================

/**
 * Authentication:
 *
 * The backend must require authentication for
 * customer order endpoints.
 *
 * Supply an Authorization header through options
 * if using Supabase JWT authentication.
 *
 * Example:
 *
 * {
 *   headers: {
 *     Authorization: `Bearer ${accessToken}`
 *   }
 * }
 *
 * Never place a service-role key here.
 */

async function orderApiRequest(
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
        throw new OrderServiceError(
          "The server returned invalid JSON.",
          "INVALID_JSON_RESPONSE",
          response.status
        );
      }
    }

    if (!response.ok) {
      throw new OrderServiceError(
        data?.message ||
          data?.error?.message ||
          "Unable to complete the order request.",
        data?.code || "ORDER_API_ERROR",
        response.status,
        data
      );
    }

    if (data === null) {
      throw new OrderServiceError(
        "The server returned an empty response.",
        "EMPTY_SERVER_RESPONSE",
        response.status
      );
    }

    return data;
  } catch (error) {
    if (error instanceof OrderServiceError) {
      throw error;
    }

    if (error?.name === "AbortError") {
      throw new OrderServiceError(
        signal?.aborted
          ? "Order request was cancelled."
          : "Order request timed out.",
        signal?.aborted
          ? "REQUEST_CANCELLED"
          : "REQUEST_TIMEOUT"
      );
    }

    throw new OrderServiceError(
      "Unable to connect to the order server. Please check your connection.",
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
// 07. NORMALIZE ORDER ITEMS
// ======================================================

export function normalizeOrderItem(item) {
  if (!isPlainObject(item)) {
    return null;
  }

  const productId =
    item.productId ??
    item.product_id ??
    item.id ??
    null;

  const quantity = Number(item.quantity);

  const price =
    normalizeAmount(
      item.unitPrice ??
      item.unit_price ??
      item.price
    );

  const lineTotal =
    normalizeAmount(
      item.lineTotal ??
      item.line_total ??
      item.total
    );

  const imageValue =
    item.image ??
    item.thumbnail ??
    null;

  const image =
    typeof imageValue === "string"
      ? imageValue
      : isPlainObject(imageValue)
        ? imageValue.src ??
          imageValue.url ??
          null
        : null;

  return {
    productId,
    variantId:
      item.variantId ??
      item.variant_id ??
      "default",

    name:
      item.name ??
      item.title ??
      "Maison Kiyora Fragrance",

    slug: item.slug ?? null,
    image,

    size: item.size ?? null,

    quantity:
      Number.isSafeInteger(quantity) &&
      quantity > 0
        ? quantity
        : null,

    unitPrice: price,

    lineTotal:
      lineTotal !== null
        ? lineTotal
        : price !== null &&
            Number.isSafeInteger(quantity) &&
            quantity > 0
          ? price * quantity
          : null,
  };
}

// ======================================================
// 08. NORMALIZE ORDER
// ======================================================

/**
 * The backend is the source of truth.
 *
 * Expected backend order example:
 *
 * {
 *   id: "order-uuid",
 *   orderNumber: "MK-0001",
 *   status: "confirmed",
 *   paymentStatus: "paid",
 *   currency: "INR",
 *   subtotal: 2950,
 *   shippingAmount: 0,
 *   taxAmount: 0,
 *   totalAmount: 2950,
 *   items: [...],
 *   shippingAddress: {...},
 *   createdAt: "...",
 *   updatedAt: "..."
 * }
 *
 * Monetary values in this order API contract
 * are expressed in INR major units.
 *
 * Razorpay payment API uses paise separately.
 *
 * Never convert units by guessing.
 */

export function normalizeOrder(order) {
  if (!isPlainObject(order)) {
    throw new OrderServiceError(
      "Invalid order data received.",
      "INVALID_ORDER_DATA"
    );
  }

  const id =
    order.id ??
    order.orderId ??
    order.order_id;

  if (!id) {
    throw new OrderServiceError(
      "Order response is missing its ID.",
      "MISSING_ORDER_ID"
    );
  }

  const rawItems =
    order.items ??
    order.orderItems ??
    order.order_items ??
    [];

  const items = Array.isArray(rawItems)
    ? rawItems
        .map(normalizeOrderItem)
        .filter(Boolean)
    : [];

  return {
    id: String(id),

    orderNumber:
      order.orderNumber ??
      order.order_number ??
      null,

    status: normalizeStatus(
      order.status ??
      order.orderStatus ??
      order.order_status,
      "pending"
    ),

    paymentStatus: normalizeStatus(
      order.paymentStatus ??
      order.payment_status,
      "pending"
    ),

    currency: order.currency ?? "INR",

    items,

    subtotal: normalizeAmount(
      order.subtotal
    ),

    shippingAmount: normalizeAmount(
      order.shippingAmount ??
      order.shipping_amount
    ),

    taxAmount: normalizeAmount(
      order.taxAmount ??
      order.tax_amount
    ),

    totalAmount: normalizeAmount(
      order.totalAmount ??
      order.total_amount ??
      order.total
    ),

    customer:
      order.customer ??
      null,

    shippingAddress:
      order.shippingAddress ??
      order.shipping_address ??
      null,

    trackingNumber:
      order.trackingNumber ??
      order.tracking_number ??
      null,

    trackingUrl:
      order.trackingUrl ??
      order.tracking_url ??
      null,

    courier:
      order.courier ??
      null,

    createdAt: normalizeDate(
      order.createdAt ??
      order.created_at
    ),

    updatedAt: normalizeDate(
      order.updatedAt ??
      order.updated_at
    ),

    deliveredAt: normalizeDate(
      order.deliveredAt ??
      order.delivered_at
    ),

    cancelledAt: normalizeDate(
      order.cancelledAt ??
      order.cancelled_at
    ),

    cancellationStatus: normalizeStatus(
      order.cancellationStatus ??
      order.cancellation_status,
      ""
    ),

    cancellationReason:
      order.cancellationReason ??
      order.cancellation_reason ??
      null,
  };
}

// ======================================================
// 09. NORMALIZE ORDER COLLECTION
// ======================================================

function normalizeOrderCollection(data) {
  const rawOrders = Array.isArray(data)
    ? data
    : data?.orders ??
      data?.data?.orders ??
      data?.data ??
      [];

  if (!Array.isArray(rawOrders)) {
    throw new OrderServiceError(
      "Invalid order list received.",
      "INVALID_ORDER_LIST"
    );
  }

  const orders = rawOrders.map(normalizeOrder);

  const pagination =
    data?.pagination ??
    data?.data?.pagination ??
    null;

  return {
    orders,

    pagination: pagination
      ? {
          page:
            Number(pagination.page) || 1,

          limit:
            Number(pagination.limit) || 10,

          total:
            Number(pagination.total) || 0,

          totalPages:
            Number(pagination.totalPages) ||
            Number(pagination.total_pages) ||
            1,

          hasNextPage:
            Boolean(
              pagination.hasNextPage ??
              pagination.has_next_page
            ),
        }
      : null,
  };
}

// ======================================================
// 10. GET MY ORDERS
// ======================================================

/**
 * GET /api/orders?page=1&limit=10
 *
 * Backend must return only orders belonging
 * to the authenticated customer.
 */

export async function getMyOrders({
  page = 1,
  limit = 10,
  status,
  signal,
  headers,
} = {}) {
  const safePage = Math.max(
    1,
    Math.floor(Number(page) || 1)
  );

  const safeLimit = Math.min(
    50,
    Math.max(
      1,
      Math.floor(Number(limit) || 10)
    )
  );

  const params = new URLSearchParams({
    page: String(safePage),
    limit: String(safeLimit),
  });

  if (
    typeof status === "string" &&
    status.trim()
  ) {
    params.set("status", status.trim());
  }

  const data = await orderApiRequest(
    `${ORDER_API_PATH}?${params.toString()}`,
    {
      signal,
      headers,
    }
  );

  return normalizeOrderCollection(data);
}

// ======================================================
// 11. GET ORDER BY ID
// ======================================================

/**
 * GET /api/orders/:orderId
 *
 * Backend must verify that the authenticated
 * user owns this order or has permission
 * to access it.
 */

export async function getOrderById(
  orderId,
  options = {}
) {
  const id = normalizeOrderId(orderId);

  const data = await orderApiRequest(
    `${ORDER_API_PATH}/${id}`,
    options
  );

  const rawOrder =
    data?.order ??
    data?.data?.order ??
    data?.data ??
    data;

  return normalizeOrder(rawOrder);
}

// ======================================================
// 12. GET ORDER STATUS
// ======================================================

/**
 * GET /api/orders/:orderId/status
 *
 * Returns fulfillment and payment status.
 *
 * Backend should reconcile payment state
 * with its verified payment records.
 */

export async function getOrderStatus(
  orderId,
  options = {}
) {
  const id = normalizeOrderId(orderId);

  const data = await orderApiRequest(
    `${ORDER_API_PATH}/${id}/status`,
    options
  );

  const result =
    data?.data ??
    data;

  if (!isPlainObject(result)) {
    throw new OrderServiceError(
      "Invalid order status response.",
      "INVALID_STATUS_RESPONSE"
    );
  }

  return {
    orderId:
      result.orderId ??
      result.order_id ??
      orderId,

    status: normalizeStatus(
      result.status ??
      result.orderStatus ??
      result.order_status
    ),

    paymentStatus: normalizeStatus(
      result.paymentStatus ??
      result.payment_status
    ),

    updatedAt: normalizeDate(
      result.updatedAt ??
      result.updated_at
    ),

    trackingNumber:
      result.trackingNumber ??
      result.tracking_number ??
      null,

    trackingUrl:
      result.trackingUrl ??
      result.tracking_url ??
      null,
  };
}

// ======================================================
// 13. GET PAYMENT STATUS
// ======================================================

/**
 * GET /api/orders/:orderId/payment-status
 *
 * Payment status must come from the backend.
 *
 * Never infer "paid" from a frontend callback.
 */

export async function getPaymentStatus(
  orderId,
  options = {}
) {
  const id = normalizeOrderId(orderId);

  const data = await orderApiRequest(
    `${ORDER_API_PATH}/${id}/payment-status`,
    options
  );

  const result =
    data?.data ??
    data;

  if (!isPlainObject(result)) {
    throw new OrderServiceError(
      "Invalid payment status response.",
      "INVALID_PAYMENT_STATUS_RESPONSE"
    );
  }

  return {
    orderId:
      result.orderId ??
      result.order_id ??
      orderId,

    paymentStatus: normalizeStatus(
      result.paymentStatus ??
      result.payment_status
    ),

    paymentMethod:
      result.paymentMethod ??
      result.payment_method ??
      null,

    paidAt: normalizeDate(
      result.paidAt ??
      result.paid_at
    ),

    updatedAt: normalizeDate(
      result.updatedAt ??
      result.updated_at
    ),
  };
}

// ======================================================
// 14. CREATE ORDER
// ======================================================

/**
 * POST /api/orders
 *
 * Use this only for a backend-defined
 * non-Razorpay order creation flow.
 *
 * For Razorpay online checkout, use:
 *
 * paymentService.processPayment()
 *
 * That service calls:
 *
 * POST /api/payments/create-order
 *
 * The payment backend must create the
 * pending internal order there.
 *
 * Do NOT call createOrder() and
 * processPayment() for the same purchase.
 *
 * Backend must independently validate:
 * - Product IDs
 * - Quantities
 * - Inventory
 * - Prices
 * - Shipping
 * - Taxes
 * - Customer authorization
 */

export async function createOrder(
  orderData,
  options = {}
) {
  if (!isPlainObject(orderData)) {
    throw new OrderServiceError(
      "Valid order details are required.",
      "INVALID_ORDER_DATA"
    );
  }

  if (
    !Array.isArray(orderData.items) ||
    orderData.items.length === 0
  ) {
    throw new OrderServiceError(
      "Cannot create an order with an empty bag.",
      "EMPTY_ORDER"
    );
  }

  const items = orderData.items.map(
    (item) => ({
      productId:
        item?.productId ??
        item?.id,

      variantId:
        item?.variantId ??
        "default",

      quantity:
        Number(item?.quantity),
    })
  );

  const invalidItems = items.some(
    (item) =>
      !item.productId ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 10
  );

  if (invalidItems) {
    throw new OrderServiceError(
      "Order contains invalid product details.",
      "INVALID_ORDER_ITEMS"
    );
  }

  const payload = {
    items,

    customer:
      orderData.customer ??
      null,

    shippingAddress:
      orderData.shippingAddress ??
      null,
  };

  const data = await orderApiRequest(
    ORDER_API_PATH,
    {
      method: "POST",
      body: payload,
      ...options,
    }
  );

  const rawOrder =
    data?.order ??
    data?.data?.order ??
    data?.data ??
    data;

  return normalizeOrder(rawOrder);
}

// ======================================================
// 15. REQUEST ORDER CANCELLATION
// ======================================================

/**
 * POST /api/orders/:orderId/cancel
 *
 * Cancellation is a request, not an
 * immediate guaranteed cancellation.
 *
 * Backend must:
 * - Verify order ownership
 * - Enforce store cancellation policy
 * - Check fulfillment status
 * - Handle any required refunds
 * - Prevent duplicate cancellation requests
 */

export async function cancelOrder(
  orderId,
  {
    reason = "",
    signal,
    headers,
  } = {}
) {
  const id = normalizeOrderId(orderId);

  const normalizedReason =
    String(reason).trim();

  if (normalizedReason.length > 500) {
    throw new OrderServiceError(
      "Cancellation reason is too long.",
      "INVALID_CANCELLATION_REASON"
    );
  }

  const data = await orderApiRequest(
    `${ORDER_API_PATH}/${id}/cancel`,
    {
      method: "POST",

      body: {
        reason: normalizedReason,
      },

      signal,
      headers,
    }
  );

  const result =
    data?.data ??
    data;

  if (!isPlainObject(result)) {
    throw new OrderServiceError(
      "Invalid cancellation response.",
      "INVALID_CANCELLATION_RESPONSE"
    );
  }

  return {
    orderId:
      result.orderId ??
      result.order_id ??
      orderId,

    cancellationStatus: normalizeStatus(
      result.cancellationStatus ??
      result.cancellation_status,
      "requested"
    ),

    message:
      result.message ??
      "Your cancellation request has been received.",
  };
}

// ======================================================
// 16. FORMAT ORDER PRICE
// ======================================================

export function formatOrderPrice(
  amount,
  currency = "INR"
) {
  if (
    amount === null ||
    amount === undefined ||
    !Number.isFinite(Number(amount))
  ) {
    return "—";
  }

  try {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }
    ).format(Number(amount));
  } catch {
    return "—";
  }
}

// ======================================================
// 17. FORMAT ORDER DATE
// ======================================================

export function formatOrderDate(
  value,
  options = {}
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      ...options,
    }
  ).format(date);
}

// ======================================================
// 18. ORDER STATUS DISPLAY HELPERS
// ======================================================

const ORDER_STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  return_requested: "Return Requested",
  returned: "Returned",
};

const PAYMENT_STATUS_LABELS = {
  pending: "Payment Pending",
  authorized: "Authorized",
  paid: "Paid",
  failed: "Payment Failed",
  refunded: "Refunded",
  partially_refunded: "Partially Refunded",
};

export function getOrderStatusLabel(status) {
  const normalized = normalizeStatus(status);

  return (
    ORDER_STATUS_LABELS[normalized] ||
    "Status Unavailable"
  );
}

export function getPaymentStatusLabel(status) {
  const normalized = normalizeStatus(status);

  return (
    PAYMENT_STATUS_LABELS[normalized] ||
    "Payment Status Unavailable"
  );
}

// ======================================================
// 19. ERROR MESSAGE HELPER
// ======================================================

export function getOrderErrorMessage(error) {
  if (error instanceof OrderServiceError) {
    return error.message;
  }

  return (
    error?.message ||
    "Something went wrong while loading your order."
  );
}

// ======================================================
// 20. DEFAULT EXPORT
// ======================================================

const orderService = {
  isOrderServiceConfigured,
  getOrderServiceConfiguration,

  getMyOrders,
  getOrderById,
  getOrderStatus,
  getPaymentStatus,

  createOrder,
  cancelOrder,

  normalizeOrder,
  normalizeOrderItem,

  formatOrderPrice,
  formatOrderDate,

  getOrderStatusLabel,
  getPaymentStatusLabel,
  getOrderErrorMessage,
};

export default orderService;
