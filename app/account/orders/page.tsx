"use client";

import Link from "next/link";
import {
  useRouter,
  useSearchParams,
  usePathname,
} from "next/navigation";
import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";

import { useAuth } from "../../../components/auth/AuthProvider";
import { supabase } from "../../../lib/supabase";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type OrderItem = {
  id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  brand_name: string;
  sku: string;
  flavor: string | null;
  size: string | null;
  servings: number | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_image_url: string | null;
};

type Order = {
  id: string;
  order_number: string;
  order_status: string;
  payment_status: string;
  payment_method: string | null;
  total_amount: number;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  currency: string;
  shipping_provider: string | null;
  tracking_id: string | null;
  tracking_url: string | null;
  customer_note: string | null;
  admin_note: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: Record<string, unknown>;
  created_at: string;
  order_items: OrderItem[];
};

/* -------------------------------------------------------------------------- */
/* Icons                                                                      */
/* -------------------------------------------------------------------------- */

function PackageIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 18V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h1" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62L18.3 8.38A1 1 0 0 0 17.5 8H14v10h1" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/* Status                                                                     */
/* -------------------------------------------------------------------------- */

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Payment Pending",
  processing: "Payment Processing",
  paid: "Paid",
  failed: "Payment Failed",
  refunded: "Refunded",
  partially_refunded: "Partially Refunded",
};

function orderStatusColor(status: string) {
  if (status === "delivered") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (
    status === "cancelled" ||
    status === "returned"
  ) {
    return "bg-red-50 text-red-600 border-red-200";
  }

  if (
    status === "shipped" ||
    status === "out_for_delivery"
  ) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }

  return "bg-[#a27d37]/10 text-[#a27d37] border-[#a27d37]/25";
}

function paymentStatusColor(status: string) {
  if (status === "paid") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "failed") {
    return "bg-red-50 text-red-600 border-red-200";
  }

  if (
    status === "refunded" ||
    status === "partially_refunded"
  ) {
    return "bg-orange-50 text-orange-700 border-orange-200";
  }

  return "bg-black/[0.04] text-black/55 border-black/10";
}

function getPaymentMethodLabel(
  method: string | null,
) {
  if (!method) return "Online Payment";

  const normalized = method.toLowerCase();

  if (normalized === "cod") {
    return "Cash on Delivery";
  }

  if (
    [
      "online",
      "online_payment",
      "razorpay",
    ].includes(normalized)
  ) {
    return "Online Payment";
  }

  return method;
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

function formatPrice(
  value: number,
  currency = "INR",
) {
  return currency === "INR"
    ? `₹${Number(value || 0).toLocaleString("en-IN")}`
    : `${currency} ${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Address                                                                    */
/* -------------------------------------------------------------------------- */

function getShippingAddress(
  address:
    | Record<string, unknown>
    | null
    | undefined,
) {
  const a = address || {};

  const fullName =
    typeof a.fullName === "string"
      ? a.fullName
      : typeof a.full_name === "string"
        ? a.full_name
        : "";

  const line1 =
    typeof a.address === "string"
      ? a.address
      : typeof a.address_line_1 === "string"
        ? a.address_line_1
        : "";

  const line2 =
    typeof a.address_line_2 === "string"
      ? a.address_line_2
      : "";

  const landmark =
    typeof a.landmark === "string"
      ? a.landmark
      : "";

  const city =
    typeof a.city === "string"
      ? a.city
      : "";

  const state =
    typeof a.state === "string"
      ? a.state
      : "";

  const pincode =
    typeof a.pincode === "string"
      ? a.pincode
      : typeof a.postal_code === "string"
        ? a.postal_code
        : "";

  const phone =
    typeof a.phone === "string"
      ? a.phone
      : "";

  const email =
    typeof a.email === "string"
      ? a.email
      : "";

  return {
    fullName,
    line1,
    line2,
    landmark,
    city,
    state,
    pincode,
    phone,
    email,
  };
}

/* -------------------------------------------------------------------------- */
/* Image fallback                                                             */
/* -------------------------------------------------------------------------- */

function ProductImage({
  src,
  alt,
  className = "",
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center text-black/20 ${className}`}
      >
        <PackageIcon />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`h-full w-full object-contain ${className}`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Order Card                                                                 */
/* -------------------------------------------------------------------------- */

function OrderCard({
  order,
  onOpen,
}: {
  order: Order;
  onOpen: (id: string) => void;
}) {
  const itemCount =
    order.order_items.reduce(
      (sum, item) =>
        sum + item.quantity,
      0,
    );

  const previewItem =
    order.order_items[0];

  return (
    <button
      type="button"
      onClick={() => onOpen(order.id)}
      className="group flex w-full flex-col overflow-hidden rounded-[24px] border border-black/[0.05] bg-white p-5 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition duration-300 hover:-translate-y-1 hover:border-[#a27d37]/25 hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)] sm:p-6"
    >
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#f5f2eb]">
          <ProductImage
            src={
              previewItem?.product_image_url
            }
            alt={
              previewItem?.product_name ||
              "Product"
            }
            className="p-2"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-black/30">
            Order
          </p>

          <p
            className="mt-1 inline-block max-w-full truncate rounded-md bg-black/[0.04] px-2 py-0.5 font-mono text-[11px] font-semibold tracking-tight text-[#171512]"
            title={order.order_number}
          >
            #{order.order_number}
          </p>

          <p className="mt-1 truncate text-xs text-black/40">
            {formatDate(order.created_at)} ·{" "}
            {itemCount}{" "}
            {itemCount === 1
              ? "item"
              : "items"}
          </p>

          <span
            className={`mt-2 inline-flex items-center rounded-full border px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] ${orderStatusColor(
              order.order_status,
            )}`}
          >
            {ORDER_STATUS_LABELS[
              order.order_status
            ] ||
              order.order_status}
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-black/[0.06] pt-4">
        <p className="text-lg font-bold">
          {formatPrice(
            order.total_amount,
            order.currency,
          )}
        </p>

        <span className="flex h-9 items-center gap-1.5 rounded-full bg-black/[0.04] px-3 text-[9px] font-bold uppercase tracking-[0.1em] text-black/50 transition group-hover:bg-[#a27d37]/10 group-hover:text-[#a27d37]">
          View
          <ArrowRightIcon />
        </span>
      </div>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Order Detail                                                               */
/* -------------------------------------------------------------------------- */

function OrderDetailView({
  order,
  onBack,
}: {
  order: Order;
  onBack: () => void;
}) {
  const shippingAddress =
    getShippingAddress(
      order.shipping_address,
    );

  const itemCount =
    order.order_items.reduce(
      (sum, item) =>
        sum + item.quantity,
      0,
    );

  const addressLines = [
    shippingAddress.line1,
    shippingAddress.line2,
  ].filter(Boolean);

  const cityLine = [
    shippingAddress.city,
    shippingAddress.state,
    shippingAddress.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="mx-auto max-w-3xl">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-black/35 transition hover:text-black"
      >
        <ArrowLeftIcon />
        Back to Orders
      </button>

      {/* HERO */}
      <div className="relative mt-6 overflow-hidden rounded-[28px] border border-black/[0.06] bg-gradient-to-br from-[#171512] via-[#1d1a15] to-[#171512] px-5 py-7 text-white shadow-[0_30px_80px_rgba(23,21,18,0.25)] sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full border border-[#cdb47b]/15" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#cdb47b]">
              Order Details
            </p>

            <p
              className="mt-3 inline-block max-w-full truncate rounded-md bg-white/10 px-2.5 py-1 font-mono text-sm font-semibold tracking-tight"
              title={order.order_number}
            >
              #{order.order_number}
            </p>

            <p className="mt-3 text-xs text-white/45">
              Placed on{" "}
              {formatDateTime(
                order.created_at,
              )}
            </p>

            <p className="mt-1 text-xs text-white/45">
              {itemCount}{" "}
              {itemCount === 1
                ? "item"
                : "items"}{" "}
              ·{" "}
              {formatPrice(
                order.total_amount,
                order.currency,
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] ${orderStatusColor(
                order.order_status,
              )}`}
            >
              {ORDER_STATUS_LABELS[
                order.order_status
              ] ||
                order.order_status}
            </span>

            <span
              className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] ${paymentStatusColor(
                order.payment_status,
              )}`}
            >
              {PAYMENT_STATUS_LABELS[
                order.payment_status
              ] ||
                order.payment_status}
            </span>
          </div>
        </div>
      </div>

      {/* SHIPPING / TRACKING */}
      {(order.shipping_provider ||
        order.tracking_id ||
        order.tracking_url) && (
        <div className="mt-5 rounded-[24px] border border-[#a27d37]/20 bg-[#a27d37]/[0.06] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#a27d37]">
            <TruckIcon />
            Shipping &amp; Tracking
          </div>

          <div className="mt-4 space-y-2 text-sm">
            {order.shipping_provider && (
              <div className="flex flex-wrap justify-between gap-2">
                <span className="text-black/45">
                  Shipped via
                </span>

                <span className="font-semibold text-[#171512]">
                  {order.shipping_provider}
                </span>
              </div>
            )}

            {order.tracking_id && (
              <div className="flex flex-wrap justify-between gap-2">
                <span className="text-black/45">
                  Tracking ID
                </span>

                <span className="break-all font-mono text-xs font-semibold text-[#171512]">
                  {order.tracking_id}
                </span>
              </div>
            )}
          </div>

          {order.tracking_url && (
            <a
              href={order.tracking_url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#171512] px-5 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-black sm:w-auto sm:px-7"
            >
              Track Shipment
            </a>
          )}
        </div>
      )}

      {/* ITEMS */}
      <div className="mt-5 rounded-[24px] border border-black/[0.05] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-black/40">
            Items
          </p>

          <p className="text-[10px] font-semibold text-black/35">
            {itemCount}{" "}
            {itemCount === 1
              ? "item"
              : "items"}
          </p>
        </div>

        <div className="mt-4 space-y-4">
          {order.order_items.map(
            (item) => (
              <div
                key={item.id}
                className="flex items-center gap-4"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f5f2eb] sm:h-20 sm:w-20">
                  <ProductImage
                    src={
                      item.product_image_url
                    }
                    alt={
                      item.product_name
                    }
                    className="p-1.5"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {item.product_name}
                  </p>

                  <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[10px] uppercase tracking-[0.08em] text-black/40">
                    {item.brand_name && (
                      <span>
                        {item.brand_name}
                      </span>
                    )}

                    {item.flavor && (
                      <span>
                        {item.flavor}
                      </span>
                    )}

                    {item.size && (
                      <span>
                        {item.size}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-xs text-black/45">
                    <span>
                      Qty {item.quantity}
                    </span>

                    <span>
                      ×{" "}
                      {formatPrice(
                        item.unit_price,
                        order.currency,
                      )}
                    </span>
                  </div>

                  {item.sku && (
                    <p className="mt-1 truncate font-mono text-[9px] text-black/25">
                      SKU: {item.sku}
                    </p>
                  )}
                </div>

                <p className="shrink-0 text-sm font-bold">
                  {formatPrice(
                    item.total_price,
                    order.currency,
                  )}
                </p>
              </div>
            ),
          )}
        </div>

        <div className="mt-5 space-y-2 border-t border-black/[0.07] pt-4 text-sm">
          <div className="flex justify-between text-black/50">
            <span>Subtotal</span>

            <span>
              {formatPrice(
                order.subtotal,
                order.currency,
              )}
            </span>
          </div>

          <div className="flex justify-between text-black/50">
            <span>Shipping</span>

            <span>
              {order.shipping_fee > 0
                ? formatPrice(
                    order.shipping_fee,
                    order.currency,
                  )
                : "Free"}
            </span>
          </div>

          {order.discount_amount > 0 && (
            <div className="flex justify-between text-black/50">
              <span>Discount</span>

              <span>
                -
                {formatPrice(
                  order.discount_amount,
                  order.currency,
                )}
              </span>
            </div>
          )}

          <div className="flex justify-between border-t border-black/[0.07] pt-3 text-base font-bold">
            <span>Total</span>

            <span>
              {formatPrice(
                order.total_amount,
                order.currency,
              )}
            </span>
          </div>
        </div>
      </div>

      {/* PAYMENT */}
      <div className="mt-5 rounded-[24px] border border-black/[0.05] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-black/40">
          Payment
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-semibold text-[#171512]">
            {getPaymentMethodLabel(
              order.payment_method,
            )}
          </span>

          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] ${paymentStatusColor(
              order.payment_status,
            )}`}
          >
            {PAYMENT_STATUS_LABELS[
              order.payment_status
            ] ||
              order.payment_status}
          </span>
        </div>
      </div>

      {/* DELIVERY ADDRESS */}
      <div className="mt-5 rounded-[24px] border border-black/[0.05] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-6">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-black/40">
          <MapPinIcon />
          Delivery Address
        </div>

        <div className="mt-4 space-y-1 text-sm text-[#171512]">
          {shippingAddress.fullName && (
            <p className="font-semibold">
              {shippingAddress.fullName}
            </p>
          )}

          {addressLines.map(
            (line, index) => (
              <p
                key={index}
                className="text-black/60"
              >
                {line}
              </p>
            ),
          )}

          {shippingAddress.landmark && (
            <p className="text-black/60">
              Landmark:{" "}
              {shippingAddress.landmark}
            </p>
          )}

          {cityLine && (
            <p className="text-black/60">
              {cityLine}
            </p>
          )}

          {shippingAddress.phone && (
            <p className="mt-2 text-black/60">
              Phone:{" "}
              {shippingAddress.phone}
            </p>
          )}

          {shippingAddress.email && (
            <p className="break-all text-black/60">
              Email:{" "}
              {shippingAddress.email}
            </p>
          )}
        </div>
      </div>

      {/* NOTES */}
      {(order.admin_note ||
        order.customer_note) && (
        <div className="mt-5 rounded-[24px] border border-black/[0.05] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-6">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-black/40">
            <NoteIcon />
            Notes
          </div>

          <div className="mt-4 space-y-4">
            {order.admin_note && (
              <div className="rounded-2xl bg-[#a27d37]/[0.06] p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#a27d37]">
                  Note from us
                </p>

                <p className="mt-1.5 whitespace-pre-line break-words text-sm text-[#171512]">
                  {order.admin_note}
                </p>
              </div>
            )}

            {order.customer_note && (
              <div className="rounded-2xl bg-black/[0.03] p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-black/40">
                  Your note
                </p>

                <p className="mt-1.5 whitespace-pre-line break-words text-sm text-[#171512]">
                  {order.customer_note}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BACK BUTTON */}
      <div className="mt-8 flex justify-center pb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-12 items-center justify-center gap-1.5 rounded-full border border-black/10 bg-white px-7 text-[9px] font-bold uppercase tracking-[0.16em] text-[#171512] transition hover:-translate-y-0.5 hover:border-[#a27d37]/30 hover:bg-[#a27d37]/5"
        >
          <ArrowLeftIcon />
          Back to Orders
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main Page                                                                  */
/* -------------------------------------------------------------------------- */

function OrdersPageInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const openOrderId =
    searchParams.get("order");

  const selectedOrder =
    openOrderId
      ? orders.find(
          (order) =>
            order.id === openOrderId,
        ) || null
      : null;

  useLayoutEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [openOrderId]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    const currentUser = user;
    let cancelled = false;

    async function loadOrders() {
      setLoading(true);

      /*
       * -----------------------------------------------------
       * GET ORDERS + ALL IMPORTANT ITEM DETAILS
       * -----------------------------------------------------
       */

      const {
        data,
        error,
      } = await supabase
        .from("orders")
        .select(
          `
            id,
            order_number,
            order_status,
            payment_status,
            payment_method,
            total_amount,
            subtotal,
            shipping_fee,
            discount_amount,
            currency,
            shipping_provider,
            tracking_id,
            tracking_url,
            customer_note,
            admin_note,
            customer_name,
            customer_email,
            customer_phone,
            shipping_address,
            created_at,
            order_items (
              id,
              product_id,
              variant_id,
              product_name,
              brand_name,
              sku,
              flavor,
              size,
              servings,
              quantity,
              unit_price,
              total_price,
              product_image_url
            )
          `,
        )
        .eq(
          "customer_id",
          currentUser.id,
        )
        .order(
          "created_at",
          {
            ascending: false,
          },
        );

      if (cancelled) {
        return;
      }

      if (error) {
        console.error(
          "Failed to load orders:",
          error,
        );

        setOrders([]);
        setLoading(false);

        return;
      }

      let normalizedOrders =
        (data ?? []) as unknown as Order[];

      /*
       * -----------------------------------------------------
       * FALLBACK IMAGE RESOLUTION
       * -----------------------------------------------------
       *
       * Image priority:
       *
       * 1. order_items.product_image_url
       * 2. Exact variant image from product_images
       * 3. Variant image_url from product_variants
       * 4. Common product image from product_images
       *
       * This supports both:
       * - existing orders created before image mapping was fixed
       * - newly created orders where the image is stored correctly
       * -----------------------------------------------------
       */

      const missingImageItems =
        normalizedOrders
          .flatMap(
            (order) =>
              order.order_items,
          )
          .filter(
            (item) =>
              !item.product_image_url,
          );

      const variantIds = Array.from(
        new Set(
          missingImageItems
            .filter(
              (item) =>
                Boolean(item.variant_id),
            )
            .map(
              (item) =>
                item.variant_id as string,
            ),
        ),
      );

      const productIds = Array.from(
        new Set(
          missingImageItems
            .filter(
              (item) =>
                Boolean(item.product_id),
            )
            .map(
              (item) =>
                item.product_id as string,
            ),
        ),
      );

      const variantImageMap =
        new Map<string, string>();

      const variantFallbackMap =
        new Map<string, string>();

      const productImageMap =
        new Map<string, string>();

      /* -----------------------------------------------------
         1. Exact variant images from product_images
      ----------------------------------------------------- */

      if (variantIds.length > 0) {
        const {
          data: variantProductImages,
          error:
            variantProductImageError,
        } =
          await supabase
            .from("product_images")
            .select(
              `
                id,
                product_id,
                variant_id,
                image_url,
                sort_order,
                is_primary
              `,
            )
            .in(
              "variant_id",
              variantIds,
            )
            .order(
              "is_primary",
              {
                ascending: false,
              },
            )
            .order(
              "sort_order",
              {
                ascending: true,
              },
            );

        if (
          variantProductImageError
        ) {
          console.error(
            "Failed to load exact variant product images:",
            variantProductImageError,
          );
        } else {
          for (
            const image of
              variantProductImages ?? []
          ) {
            if (
              !image.variant_id ||
              !image.image_url
            ) {
              continue;
            }

            if (
              !variantImageMap.has(
                image.variant_id,
              )
            ) {
              variantImageMap.set(
                image.variant_id,
                image.image_url,
              );
            }
          }
        }
      }

      /* -----------------------------------------------------
         2. Variant-level image_url fallback
      ----------------------------------------------------- */

      if (variantIds.length > 0) {
        const {
          data: variantRows,
          error:
            variantImageError,
        } =
          await supabase
            .from(
              "product_variants",
            )
            .select(
              `
                id,
                image_url
              `,
            )
            .in(
              "id",
              variantIds,
            );

        if (
          variantImageError
        ) {
          console.error(
            "Failed to load variant image_url fallbacks:",
            variantImageError,
          );
        } else {
          for (
            const variant of
              variantRows ?? []
          ) {
            if (
              variant.id &&
              variant.image_url
            ) {
              variantFallbackMap.set(
                variant.id,
                variant.image_url,
              );
            }
          }
        }
      }

      /* -----------------------------------------------------
         3. Common product images
      ----------------------------------------------------- */

      if (productIds.length > 0) {
        const {
          data: commonProductImages,
          error:
            commonProductImageError,
        } =
          await supabase
            .from("product_images")
            .select(
              `
                id,
                product_id,
                variant_id,
                image_url,
                sort_order,
                is_primary
              `,
            )
            .in(
              "product_id",
              productIds,
            )
            .is(
              "variant_id",
              null,
            )
            .order(
              "is_primary",
              {
                ascending: false,
              },
            )
            .order(
              "sort_order",
              {
                ascending: true,
              },
            );

        if (
          commonProductImageError
        ) {
          console.error(
            "Failed to load common product images:",
            commonProductImageError,
          );
        } else {
          for (
            const image of
              commonProductImages ?? []
          ) {
            if (
              !image.product_id ||
              !image.image_url
            ) {
              continue;
            }

            if (
              !productImageMap.has(
                image.product_id,
              )
            ) {
              productImageMap.set(
                image.product_id,
                image.image_url,
              );
            }
          }
        }
      }

      /* -----------------------------------------------------
         4. Apply the best available fallback
      ----------------------------------------------------- */

      if (
        missingImageItems.length > 0
      ) {
        normalizedOrders =
          normalizedOrders.map(
            (order) => ({
              ...order,

              order_items:
                order.order_items.map(
                  (item) => {
                    if (
                      item.product_image_url
                    ) {
                      return item;
                    }

                    const exactVariantImage =
                      item.variant_id
                        ? variantImageMap.get(
                            item.variant_id,
                          )
                        : undefined;

                    const variantImageUrl =
                      item.variant_id
                        ? variantFallbackMap.get(
                            item.variant_id,
                          )
                        : undefined;

                    const commonProductImage =
                      item.product_id
                        ? productImageMap.get(
                            item.product_id,
                          )
                        : undefined;

                    const fallbackImage =
                      exactVariantImage ??
                      variantImageUrl ??
                      commonProductImage;

                    if (
                      !fallbackImage
                    ) {
                      return item;
                    }

                    return {
                      ...item,
                      product_image_url:
                        fallbackImage,
                    };
                  },
                ),
            }),
          );
      }

      setOrders(
        normalizedOrders,
      );

      setLoading(false);
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [
    user,
    authLoading,
    router,
  ]);

  const openOrder = (
    id: string,
  ) => {
    router.push(
      `${pathname}?order=${id}`,
    );
  };

  const closeOrder = () => {
    router.push(pathname);
  };

  /* ---------------------------------------------------------------------- */
  /* Loading                                                                */
  /* ---------------------------------------------------------------------- */

  if (
    authLoading ||
    !user ||
    loading
  ) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-white px-5 pt-28 sm:px-8 sm:pt-32">
        <div className="mx-auto max-w-4xl">
          <div className="h-3 w-24 animate-pulse rounded-full bg-black/10" />

          <div className="mt-4 h-10 w-56 max-w-full animate-pulse rounded-xl bg-black/10" />

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              1,
              2,
              3,
              4,
            ].map(
              (item) => (
                <div
                  key={item}
                  className="h-40 animate-pulse rounded-[24px] border border-black/[0.05] bg-black/[0.04]"
                />
              ),
            )}
          </div>
        </div>
      </main>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Order not found                                                        */
  /* ---------------------------------------------------------------------- */

  if (
    openOrderId &&
    !selectedOrder
  ) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-white px-5 pt-28 text-[#171512] sm:px-8 sm:pt-32">
        <div className="mx-auto flex max-w-3xl flex-col items-center py-16 text-center">
          <button
            type="button"
            onClick={closeOrder}
            className="mb-8 self-start text-[9px] font-bold uppercase tracking-[0.16em] text-black/35 transition hover:text-black"
          >
            ← Back to Orders
          </button>

          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-500">
            <PackageIcon />
          </div>

          <h1 className="mt-6 font-serif text-2xl italic tracking-[-0.02em] sm:text-3xl">
            Order not found
          </h1>

          <p className="mt-3 max-w-sm text-sm leading-6 text-black/45">
            This order doesn't exist or doesn't belong to your account.
          </p>
        </div>
      </main>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Empty                                                                  */
  /* ---------------------------------------------------------------------- */

  if (orders.length === 0) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-white px-5 pt-28 text-[#171512] sm:px-8 sm:pt-32">
        <div className="mx-auto flex max-w-4xl flex-col items-center py-16 text-center">
          <Link
            href="/account"
            className="mb-8 self-start text-[9px] font-bold uppercase tracking-[0.16em] text-black/35 transition hover:text-black"
          >
            ← Back to account
          </Link>

          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#a27d37]/25 bg-[#a27d37]/10 text-[#a27d37]">
            <PackageIcon />
          </div>

          <h1 className="mt-6 break-words font-serif text-3xl italic tracking-[-0.02em] sm:text-4xl">
            No orders yet.
          </h1>

          <p className="mt-3 max-w-sm text-sm leading-6 text-black/45">
            When you place an order, it will show up here so you can track it anytime.
          </p>

          <Link
            href="/shop"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[#171512] px-7 text-[9px] font-bold uppercase tracking-[0.18em] text-white transition hover:-translate-y-0.5 hover:bg-black"
          >
            Start Shopping
          </Link>
        </div>
      </main>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Detail                                                                  */
  /* ---------------------------------------------------------------------- */

  if (selectedOrder) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-white px-5 pb-16 pt-28 text-[#171512] sm:px-8 sm:pt-32">
        <OrderDetailView
          order={selectedOrder}
          onBack={closeOrder}
        />
      </main>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* List                                                                    */
  /* ---------------------------------------------------------------------- */

  return (
    <main className="min-h-screen overflow-x-hidden bg-white px-5 pb-24 pt-28 text-[#171512] sm:px-8 sm:pt-32">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-black/35 transition hover:text-black"
        >
          ← Back to account
        </Link>

        <div className="relative mt-7 overflow-hidden rounded-[32px] border border-black/[0.06] bg-gradient-to-br from-[#171512] via-[#1d1a15] to-[#171512] px-6 py-8 text-white shadow-[0_30px_80px_rgba(23,21,18,0.25)] sm:px-9 sm:py-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full border border-[#cdb47b]/15" />

          <div className="relative">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#cdb47b]">
              Order History
            </p>

            <h1 className="mt-3 break-words font-serif text-4xl italic tracking-[-0.02em] sm:text-5xl">
              My Orders
            </h1>

            <p className="mt-4 text-sm leading-6 text-white/45">
              {orders.length}{" "}
              {orders.length === 1
                ? "order"
                : "orders"}{" "}
              placed with Seven Bucks Nutrition.
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
          {orders.map(
            (order) => (
              <OrderCard
                key={order.id}
                order={order}
                onOpen={openOrder}
              />
            ),
          )}
        </div>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Suspense fallback                                                          */
/* -------------------------------------------------------------------------- */

function OrdersPageLoadingFallback() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white px-5 pt-28 sm:px-8 sm:pt-32">
      <div className="mx-auto max-w-4xl">
        <div className="h-3 w-24 animate-pulse rounded-full bg-black/10" />

        <div className="mt-4 h-10 w-56 max-w-full animate-pulse rounded-xl bg-black/10" />

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            1,
            2,
            3,
            4,
          ].map(
            (item) => (
              <div
                key={item}
                className="h-40 animate-pulse rounded-[24px] border border-black/[0.05] bg-black/[0.04]"
              />
            ),
          )}
        </div>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Export                                                                     */
/* -------------------------------------------------------------------------- */

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <OrdersPageLoadingFallback />
      }
    >
      <OrdersPageInner />
    </Suspense>
  );
}