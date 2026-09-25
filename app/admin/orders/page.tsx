"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "../../../lib/supabase";

type ShippingAddress = {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;

  // Legacy keys kept for compatibility with older orders.
  address_line_1?: string;
  address_line_2?: string;
  postal_code?: string;

  [key: string]: any;
};

type Order = {
  id: string;
  order_number: string;

  customer_id: string | null;
  customer_address_id: string | null;

  customer_name: string;
  customer_email: string;
  customer_phone: string;

  shipping_address: ShippingAddress;

  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total_amount: number;
  currency: string;

  payment_method: string | null;
  payment_status: string;
  order_status: string;

  shipping_provider: string | null;
  tracking_id: string | null;
  tracking_url: string | null;

  customer_note: string | null;
  admin_note: string | null;

  placed_at: string | null;
  created_at: string;
  updated_at: string;
};

type EditForm = {
  customer_name: string;
  customer_email: string;
  customer_phone: string;

  address_line_1: string;
  address_line_2: string;
  landmark: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;

  subtotal: string;
  shipping_fee: string;
  discount_amount: string;
  total_amount: string;

  currency: string;
  payment_method: string;
  payment_status: string;
  order_status: string;

  shipping_provider: string;
  tracking_id: string;
  tracking_url: string;

  customer_note: string;
  admin_note: string;
};

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
];

const PAYMENT_STATUSES = [
  "pending",
  "processing",
  "paid",
  "failed",
  "refunded",
  "partially_refunded",
];

const PAYMENT_METHODS = [
  "cod",
  "razorpay",
  "upi",
  "card",
  "netbanking",
];

function formatMoney(amount: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function formatDate(date: string | null) {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStatus(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusClass(status: string) {
  switch (status) {
    case "delivered":
    case "paid":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "cancelled":
    case "failed":
    case "returned":
      return "bg-red-50 text-red-600 border-red-200";

    case "shipped":
    case "out_for_delivery":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "processing":
    case "packed":
    case "confirmed":
      return "bg-[#f7f0df] text-[#856b32] border-[#e7d9b8]";

    default:
      return "bg-black/[0.035] text-black/55 border-black/10";
  }
}

function Icon({
  name,
  size = 18,
}: {
  name: string;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "search") {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
    );
  }

  if (name === "shopping") {
    return (
      <svg {...common}>
        <path d="M6 8h12l1 13H5L6 8Z" />
        <path d="M9 8a3 3 0 0 1 6 0" />
      </svg>
    );
  }

  if (name === "package") {
    return (
      <svg {...common}>
        <path d="m21 8-9-5-9 5 9 5 9-5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </svg>
    );
  }

  if (name === "refresh") {
    return (
      <svg {...common}>
        <path d="M20 11a8 8 0 0 0-14.8-4" />
        <path d="M4 4v5h5" />
        <path d="M4 13a8 8 0 0 0 14.8 4" />
        <path d="M20 20v-5h-5" />
      </svg>
    );
  }

  if (name === "eye") {
    return (
      <svg {...common}>
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    );
  }

  if (name === "edit") {
    return (
      <svg {...common}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </svg>
    );
  }

  if (name === "save") {
    return (
      <svg {...common}>
        <path d="M5 4h12l2 2v14H5z" />
        <path d="M8 4v6h8V4" />
        <path d="M8 20v-6h8v6" />
      </svg>
    );
  }

  if (name === "trash") {
    return (
      <svg {...common}>
        <path d="M4 7h16" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M6 7l1 14h10l1-14" />
        <path d="M9 7V4h6v3" />
      </svg>
    );
  }

  if (name === "close") {
    return (
      <svg {...common}>
        <path d="m6 6 12 12" />
        <path d="m18 6-12 12" />
      </svg>
    );
  }

  if (name === "chevron") {
    return (
      <svg {...common}>
        <path d="m6 9 6 6 6-6" />
      </svg>
    );
  }

  if (name === "user") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 21a7 7 0 0 1 14 0" />
      </svg>
    );
  }

  if (name === "wallet") {
    return (
      <svg {...common}>
        <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H20v14H6.5A2.5 2.5 0 0 1 4 16.5v-9Z" />
        <path d="M4 8h13" />
        <path d="M16 12h4" />
      </svg>
    );
  }

  if (name === "truck") {
    return (
      <svg {...common}>
        <path d="M3 6h11v11H3z" />
        <path d="M14 10h4l3 3v4h-7z" />
        <circle cx="7" cy="19" r="2" />
        <circle cx="18" cy="19" r="2" />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4" />
        <path d="M8 3v4" />
        <path d="M3 10h18" />
      </svg>
    );
  }

  if (name === "location") {
    return (
      <svg {...common}>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg {...common}>
        <path d="m5 12 4 4L19 6" />
      </svg>
    );
  }

  return null;
}

function createEditForm(order: Order): EditForm {
  const address = order.shipping_address || {};

  return {
    customer_name: order.customer_name || "",
    customer_email: order.customer_email || "",
    customer_phone: order.customer_phone || "",

    address_line_1:
      address.address ||
      address.address_line_1 ||
      "",
    address_line_2:
      address.address_line_2 || "",
    landmark: address.landmark || "",
    city: address.city || "",
    state: address.state || "",
    postal_code:
      address.pincode ||
      address.postal_code ||
      "",
    country: address.country || "India",

    subtotal: String(order.subtotal ?? 0),
    shipping_fee: String(order.shipping_fee ?? 0),
    discount_amount: String(order.discount_amount ?? 0),
    total_amount: String(order.total_amount ?? 0),

    currency: order.currency || "INR",
    payment_method: order.payment_method || "",
    payment_status: order.payment_status || "pending",
    order_status: order.order_status || "pending",

    shipping_provider: order.shipping_provider || "",
    tracking_id: order.tracking_id || "",
    tracking_url: order.tracking_url || "",

    customer_note: order.customer_note || "",
    admin_note: order.admin_note || "",
  };
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const [selectedOrder, setSelectedOrder] =
    useState<Order | null>(null);

  const [editingOrder, setEditingOrder] =
    useState<Order | null>(null);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [savingEdit, setSavingEdit] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  async function fetchOrders(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Orders fetch error:", error);
        alert(error.message);
        return;
      }

      setOrders((data || []) as Order[]);
    } catch (error) {
      console.error("Orders fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  function showSuccess(message: string) {
    setSuccessMessage(message);

    window.setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  }

  async function updateOrderStatus(
    orderId: string,
    newStatus: string
  ) {
    try {
      setUpdatingId(orderId);

      const { data, error } = await supabase
        .from("orders")
        .update({
          order_status: newStatus,
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        console.error(
          "Order status update error:",
          error
        );
        alert(error.message);
        return;
      }

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? {
                ...order,
                order_status: data.order_status,
                updated_at: data.updated_at,
              }
            : order
        )
      );

      setSelectedOrder((current) =>
        current && current.id === orderId
          ? {
              ...current,
              order_status: data.order_status,
              updated_at: data.updated_at,
            }
          : current
      );

      setEditingOrder((current) =>
        current && current.id === orderId
          ? {
              ...current,
              order_status: data.order_status,
              updated_at: data.updated_at,
            }
          : current
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function updatePaymentStatus(
    orderId: string,
    newStatus: string
  ) {
    try {
      setUpdatingId(orderId);

      const { data, error } = await supabase
        .from("orders")
        .update({
          payment_status: newStatus,
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        console.error(
          "Payment status update error:",
          error
        );
        alert(error.message);
        return;
      }

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? {
                ...order,
                payment_status: data.payment_status,
                updated_at: data.updated_at,
              }
            : order
        )
      );

      setSelectedOrder((current) =>
        current && current.id === orderId
          ? {
              ...current,
              payment_status: data.payment_status,
              updated_at: data.updated_at,
            }
          : current
      );

      setEditingOrder((current) =>
        current && current.id === orderId
          ? {
              ...current,
              payment_status: data.payment_status,
              updated_at: data.updated_at,
            }
          : current
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function saveOrderEdit(
    orderId: string,
    form: EditForm
  ) {
    try {
      setSavingEdit(true);

      const subtotal = Number(form.subtotal || 0);
      const shippingFee = Number(
        form.shipping_fee || 0
      );
      const discountAmount = Number(
        form.discount_amount || 0
      );
      const totalAmount = Number(
        form.total_amount || 0
      );

      if (!form.customer_name.trim()) {
        alert("Customer name is required.");
        return;
      }

      if (!form.customer_email.trim()) {
        alert("Customer email is required.");
        return;
      }

      if (!form.customer_phone.trim()) {
        alert("Customer phone is required.");
        return;
      }

      if (!form.address_line_1.trim()) {
        alert("Address line 1 is required.");
        return;
      }

      if (!form.city.trim()) {
        alert("City is required.");
        return;
      }

      if (!form.state.trim()) {
        alert("State is required.");
        return;
      }

      if (!form.postal_code.trim()) {
        alert("Postal code is required.");
        return;
      }

      if (
        [subtotal, shippingFee, discountAmount, totalAmount].some(
          (value) => Number.isNaN(value) || value < 0
        )
      ) {
        alert(
          "Subtotal, shipping, discount and total must be valid positive numbers."
        );
        return;
      }

      const shippingAddress: ShippingAddress = {
        fullName: form.customer_name.trim(),
        email: form.customer_email.trim(),
        phone: form.customer_phone.trim(),
        address: form.address_line_1.trim(),
        ...(form.address_line_2.trim()
          ? { address_line_2: form.address_line_2.trim() }
          : {}),
        ...(form.landmark.trim()
          ? { landmark: form.landmark.trim() }
          : {}),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.postal_code.trim(),
        country: form.country.trim() || "India",
      };

      const { data, error } = await supabase
        .from("orders")
        .update({
          customer_name:
            form.customer_name.trim(),

          customer_email:
            form.customer_email.trim(),

          customer_phone:
            form.customer_phone.trim(),

          shipping_address:
            shippingAddress,

          subtotal,
          shipping_fee: shippingFee,
          discount_amount: discountAmount,
          total_amount: totalAmount,

          currency:
            form.currency.trim() || "INR",

          payment_method:
            form.payment_method.trim() || null,

          payment_status:
            form.payment_status,

          order_status:
            form.order_status,

          shipping_provider:
            form.shipping_provider.trim() || null,

          tracking_id:
            form.tracking_id.trim() || null,

          tracking_url:
            form.tracking_url.trim() || null,

          customer_note:
            form.customer_note.trim() || null,

          admin_note:
            form.admin_note.trim() || null,
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        console.error(
          "Order edit save error:",
          error
        );
        alert(error.message);
        return;
      }

      const updatedOrder = data as Order;

      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? updatedOrder
            : order
        )
      );

      setSelectedOrder(updatedOrder);
      setEditingOrder(null);

      showSuccess(
        `Order #${updatedOrder.order_number} updated successfully.`
      );
    } catch (error) {
      console.error(
        "Order edit save error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the order."
      );
    } finally {
      setSavingEdit(false);
    }
  }

  async function deleteOrder(order: Order) {
    const confirmed = window.confirm(
      `Delete order ${order.order_number}?\n\nThis will permanently remove the order and its items.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(order.id);

      const { error: itemsError } =
        await supabase
          .from("order_items")
          .delete()
          .eq("order_id", order.id);

      if (itemsError) {
        console.error(
          "Order items delete error:",
          itemsError
        );
        alert(itemsError.message);
        return;
      }

      const { error } = await supabase
        .from("orders")
        .delete()
        .eq("id", order.id);

      if (error) {
        console.error(
          "Order delete error:",
          error
        );
        alert(error.message);
        return;
      }

      setOrders((current) =>
        current.filter(
          (item) => item.id !== order.id
        )
      );

      if (selectedOrder?.id === order.id) {
        setSelectedOrder(null);
      }

      if (editingOrder?.id === order.id) {
        setEditingOrder(null);
      }

      showSuccess(
        `Order #${order.order_number} deleted successfully.`
      );
    } finally {
      setDeletingId(null);
    }
  }

  const filteredOrders = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.order_number
          .toLowerCase()
          .includes(query) ||
        order.customer_name
          .toLowerCase()
          .includes(query) ||
        order.customer_email
          .toLowerCase()
          .includes(query) ||
        order.customer_phone
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        order.order_status === statusFilter;

      const matchesPayment =
        paymentFilter === "all" ||
        order.payment_status === paymentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPayment
      );
    });
  }, [
    orders,
    search,
    statusFilter,
    paymentFilter,
  ]);

  const stats = useMemo(() => {
    const revenue = orders.reduce(
      (sum, order) =>
        sum + Number(order.total_amount || 0),
      0
    );

    return {
      total: orders.length,

      pending: orders.filter(
        (order) =>
          order.order_status === "pending"
      ).length,

      processing: orders.filter((order) =>
        [
          "confirmed",
          "processing",
          "packed",
        ].includes(order.order_status)
      ).length,

      shipped: orders.filter((order) =>
        [
          "shipped",
          "out_for_delivery",
        ].includes(order.order_status)
      ).length,

      delivered: orders.filter(
        (order) =>
          order.order_status === "delivered"
      ).length,

      revenue,
    };
  }, [orders]);

  return (
    <main className="min-h-screen bg-[#f3f0e9] text-[#171512]">
      {/* SUCCESS TOAST */}
      {successMessage && (
        <div className="fixed right-5 top-5 z-[500]">
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-5 py-4 shadow-[0_18px_50px_rgba(0,0,0,0.14)]">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Icon name="check" size={16} />
            </div>

            <div>
              <p className="text-xs font-bold">
                Success
              </p>

              <p className="mt-0.5 text-[10px] text-black/45">
                {successMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
        {/* PAGE HEADER */}
        <section className="relative overflow-hidden rounded-[28px] bg-[#171512] px-6 py-7 text-[#f5f2eb] shadow-[0_18px_60px_rgba(23,21,18,0.12)] sm:px-8 sm:py-8 lg:px-10">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#cdb47b]/10 blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#cdb47b]" />

                <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#cdb47b]">
                  Seven Bucks Nutrition
                </p>
              </div>

              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
                Orders
              </h1>

              <p className="mt-3 max-w-xl text-xs leading-6 text-white/45 sm:text-sm">
                Manage customer orders, payments,
                fulfilment and shipment details from one
                place.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-white/35">
                  Showing
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {filteredOrders.length}{" "}
                  <span className="font-normal text-white/30">
                    / {orders.length}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  fetchOrders(true)
                }
                disabled={refreshing}
                className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[#cdb47b] px-4 text-[9px] font-bold uppercase tracking-[0.14em] text-[#171512] transition hover:bg-[#d8c28e] disabled:opacity-50"
              >
                <Icon
                  name="refresh"
                  size={15}
                />

                {refreshing
                  ? "Refreshing"
                  : "Refresh"}
              </button>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Total Orders"
            value={stats.total}
            icon="shopping"
          />

          <StatCard
            label="Pending"
            value={stats.pending}
            icon="calendar"
          />

          <StatCard
            label="Processing"
            value={stats.processing}
            icon="package"
          />

          <StatCard
            label="Shipped"
            value={stats.shipped}
            icon="truck"
          />

          <StatCard
            label="Revenue"
            value={formatMoney(stats.revenue)}
            icon="wallet"
          />
        </section>

        {/* FILTER BAR */}
        <section className="mt-5 rounded-[24px] border border-black/[0.07] bg-white p-4 shadow-[0_8px_30px_rgba(23,21,18,0.035)] sm:p-5">
          <div className="flex flex-col gap-3 xl:flex-row">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/30">
                <Icon
                  name="search"
                  size={17}
                />
              </div>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search order, customer, email or phone..."
                className="h-12 w-full rounded-2xl border border-black/[0.08] bg-[#faf9f6] pl-11 pr-4 text-xs outline-none transition placeholder:text-black/25 focus:border-[#cdb47b] focus:bg-white"
              />
            </div>

            <FilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={ORDER_STATUSES}
              placeholder="All Order Status"
            />

            <FilterSelect
              value={paymentFilter}
              onChange={setPaymentFilter}
              options={PAYMENT_STATUSES}
              placeholder="All Payment Status"
            />

            {(search ||
              statusFilter !== "all" ||
              paymentFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setPaymentFilter("all");
                }}
                className="h-12 rounded-2xl border border-black/[0.08] px-5 text-[9px] font-bold uppercase tracking-[0.13em] text-black/45 transition hover:border-black/20 hover:text-black"
              >
                Clear
              </button>
            )}
          </div>
        </section>

        {/* ORDERS */}
        <section className="mt-5 overflow-hidden rounded-[24px] border border-black/[0.07] bg-white shadow-[0_8px_30px_rgba(23,21,18,0.035)]">
          <div className="flex flex-col gap-3 border-b border-black/[0.07] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#cdb47b]" />

                <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-[#9c8250]">
                  Order Management
                </p>
              </div>

              <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.03em]">
                All orders
              </h2>
            </div>

            <p className="text-[10px] text-black/35">
              Latest orders appear first
            </p>
          </div>

          {loading ? (
            <LoadingState />
          ) : filteredOrders.length === 0 ? (
            <EmptyState
              hasOrders={orders.length > 0}
            />
          ) : (
            <>
              {/* DESKTOP */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-black/[0.06] bg-[#faf9f6]">
                      <TableHead>
                        Order
                      </TableHead>

                      <TableHead>
                        Customer
                      </TableHead>

                      <TableHead>
                        Amount
                      </TableHead>

                      <TableHead>
                        Payment
                      </TableHead>

                      <TableHead>
                        Status
                      </TableHead>

                      <TableHead>
                        Date
                      </TableHead>

                      <TableHead align="right">
                        Actions
                      </TableHead>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrders.map(
                      (order) => (
                        <tr
                          key={order.id}
                          className="border-b border-black/[0.05] last:border-b-0 hover:bg-[#fcfbf8]"
                        >
                          <td className="px-5 py-5">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedOrder(
                                  order
                                )
                              }
                              className="text-left"
                            >
                              <p className="text-xs font-bold transition hover:text-[#9c8250]">
                                #{order.order_number}
                              </p>

                              <p className="mt-1 font-mono text-[8px] text-black/25">
                                {order.id.slice(
                                  0,
                                  8
                                )}
                                ...
                              </p>
                            </button>
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f3f0e9] text-black/35">
                                <Icon
                                  name="user"
                                  size={15}
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-xs font-semibold">
                                  {
                                    order.customer_name
                                  }
                                </p>

                                <p className="mt-1 max-w-[180px] truncate text-[9px] text-black/35">
                                  {
                                    order.customer_email
                                  }
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <p className="text-sm font-bold tracking-[-0.02em]">
                              {formatMoney(
                                order.total_amount,
                                order.currency
                              )}
                            </p>

                            {Number(
                              order.discount_amount
                            ) > 0 && (
                              <p className="mt-1 text-[8px] font-medium text-emerald-600">
                                −{" "}
                                {formatMoney(
                                  order.discount_amount,
                                  order.currency
                                )}{" "}
                                discount
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-5">
                            <StatusSelect
                              value={
                                order.payment_status
                              }
                              options={
                                PAYMENT_STATUSES
                              }
                              disabled={
                                updatingId ===
                                order.id
                              }
                              onChange={(value) =>
                                updatePaymentStatus(
                                  order.id,
                                  value
                                )
                              }
                            />
                          </td>

                          <td className="px-5 py-5">
                            <StatusSelect
                              value={
                                order.order_status
                              }
                              options={
                                ORDER_STATUSES
                              }
                              disabled={
                                updatingId ===
                                order.id
                              }
                              onChange={(value) =>
                                updateOrderStatus(
                                  order.id,
                                  value
                                )
                              }
                            />
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex items-center gap-2 text-black/40">
                              <Icon
                                name="calendar"
                                size={13}
                              />

                              <span className="text-[9px]">
                                {formatDate(
                                  order.created_at
                                )}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex justify-end gap-2">
                              <ActionButton
                                title="View order"
                                onClick={() =>
                                  setSelectedOrder(
                                    order
                                  )
                                }
                              >
                                <Icon
                                  name="eye"
                                  size={15}
                                />
                              </ActionButton>

                              <ActionButton
                                title="Edit order"
                                onClick={() =>
                                  setEditingOrder(
                                    order
                                  )
                                }
                              >
                                <Icon
                                  name="edit"
                                  size={15}
                                />
                              </ActionButton>

                              <ActionButton
                                danger
                                title="Delete order"
                                disabled={
                                  deletingId ===
                                  order.id
                                }
                                onClick={() =>
                                  deleteOrder(
                                    order
                                  )
                                }
                              >
                                <Icon
                                  name="trash"
                                  size={15}
                                />
                              </ActionButton>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}
              <div className="divide-y divide-black/[0.06] lg:hidden">
                {filteredOrders.map(
                  (order) => (
                    <div
                      key={order.id}
                      className="p-4 sm:p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedOrder(
                              order
                            )
                          }
                          className="text-left"
                        >
                          <p className="text-sm font-bold">
                            #{order.order_number}
                          </p>

                          <p className="mt-1 text-[9px] text-black/35">
                            {formatDate(
                              order.created_at
                            )}
                          </p>
                        </button>

                        <p className="text-sm font-bold">
                          {formatMoney(
                            order.total_amount,
                            order.currency
                          )}
                        </p>
                      </div>

                      <div className="mt-4 rounded-2xl bg-[#faf9f6] p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black/35">
                            <Icon
                              name="user"
                              size={16}
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-semibold">
                              {
                                order.customer_name
                              }
                            </p>

                            <p className="mt-1 truncate text-[9px] text-black/40">
                              {
                                order.customer_email
                              }
                            </p>

                            <p className="mt-0.5 text-[9px] text-black/40">
                              {
                                order.customer_phone
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div>
                          <p className="mb-2 text-[8px] font-bold uppercase tracking-[0.15em] text-black/30">
                            Payment
                          </p>

                          <StatusSelect
                            value={
                              order.payment_status
                            }
                            options={
                              PAYMENT_STATUSES
                            }
                            disabled={
                              updatingId ===
                              order.id
                            }
                            onChange={(value) =>
                              updatePaymentStatus(
                                order.id,
                                value
                              )
                            }
                            fullWidth
                          />
                        </div>

                        <div>
                          <p className="mb-2 text-[8px] font-bold uppercase tracking-[0.15em] text-black/30">
                            Status
                          </p>

                          <StatusSelect
                            value={
                              order.order_status
                            }
                            options={
                              ORDER_STATUSES
                            }
                            disabled={
                              updatingId ===
                              order.id
                            }
                            onChange={(value) =>
                              updateOrderStatus(
                                order.id,
                                value
                              )
                            }
                            fullWidth
                          />
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-[1fr_1fr_auto] gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedOrder(
                              order
                            )
                          }
                          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#171512] text-[9px] font-bold uppercase tracking-[0.13em] text-white"
                        >
                          <Icon
                            name="eye"
                            size={14}
                          />

                          View
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setEditingOrder(
                              order
                            )
                          }
                          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-black/10 bg-white text-[9px] font-bold uppercase tracking-[0.13em] text-black/60"
                        >
                          <Icon
                            name="edit"
                            size={14}
                          />

                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteOrder(order)
                          }
                          disabled={
                            deletingId ===
                            order.id
                          }
                          className="flex h-10 w-11 items-center justify-center rounded-xl border border-red-100 text-red-500 disabled:opacity-40"
                        >
                          <Icon
                            name="trash"
                            size={14}
                          />
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </>
          )}
        </section>
      </div>

      {/* VIEW MODAL */}
      {selectedOrder && (
        <OrderDetails
          order={selectedOrder}
          updatingId={updatingId}
          deletingId={deletingId}
          onClose={() =>
            setSelectedOrder(null)
          }
          onEdit={() => {
            setEditingOrder(
              selectedOrder
            );
          }}
          onOrderStatusChange={
            updateOrderStatus
          }
          onPaymentStatusChange={
            updatePaymentStatus
          }
          onDelete={() =>
            deleteOrder(selectedOrder)
          }
        />
      )}

      {/* EDIT MODAL */}
      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          saving={savingEdit}
          onClose={() =>
            setEditingOrder(null)
          }
          onSave={saveOrderEdit}
        />
      )}
    </main>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="group rounded-[22px] border border-black/[0.07] bg-white p-5 shadow-[0_6px_24px_rgba(23,21,18,0.025)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(23,21,18,0.06)]">
      <div className="flex items-start justify-between">
        <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-black/35">
          {label}
        </p>

        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#f3f0e9] text-[#9c8250]">
          <Icon name={icon} size={14} />
        </div>
      </div>

      <p className="mt-5 truncate text-2xl font-semibold tracking-[-0.05em]">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   FILTER
========================================================= */

function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div className="relative xl:w-[205px]">
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-12 w-full appearance-none rounded-2xl border border-black/[0.08] bg-[#faf9f6] px-4 pr-10 text-[10px] font-semibold outline-none transition focus:border-[#cdb47b] focus:bg-white"
      >
        <option value="all">
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {formatStatus(option)}
          </option>
        ))}
      </select>

      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/30">
        <Icon
          name="chevron"
          size={14}
        />
      </div>
    </div>
  );
}

/* =========================================================
   STATUS SELECT
========================================================= */

function StatusSelect({
  value,
  options,
  disabled,
  onChange,
  fullWidth = false,
}: {
  value: string;
  options: string[];
  disabled?: boolean;
  onChange: (value: string) => void;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={`relative ${
        fullWidth ? "w-full" : "w-fit"
      }`}
    >
      <select
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={`h-8 appearance-none rounded-full border px-3 pr-7 text-[8px] font-bold outline-none transition disabled:opacity-50 ${
          fullWidth ? "w-full" : ""
        } ${statusClass(value)}`}
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {formatStatus(option)}
          </option>
        ))}
      </select>

      <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-50">
        <Icon
          name="chevron"
          size={11}
        />
      </div>
    </div>
  );
}

/* =========================================================
   TABLE HEAD
========================================================= */

function TableHead({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-5 py-3 text-[8px] font-bold uppercase tracking-[0.17em] text-black/30 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

/* =========================================================
   ACTION BUTTON
========================================================= */

function ActionButton({
  children,
  title,
  onClick,
  danger = false,
  disabled = false,
}: {
  children: ReactNode;
  title: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-9 w-9 items-center justify-center rounded-xl border transition disabled:opacity-30 ${
        danger
          ? "border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600"
          : "border-black/[0.08] text-black/40 hover:border-black/15 hover:bg-[#f3f0e9] hover:text-black"
      }`}
    >
      {children}
    </button>
  );
}

/* =========================================================
   VIEW ORDER MODAL
========================================================= */

function OrderDetails({
  order,
  updatingId,
  deletingId,
  onClose,
  onEdit,
  onOrderStatusChange,
  onPaymentStatusChange,
  onDelete,
}: {
  order: Order;
  updatingId: string | null;
  deletingId: string | null;
  onClose: () => void;
  onEdit: () => void;
  onOrderStatusChange: (
    orderId: string,
    status: string
  ) => void;
  onPaymentStatusChange: (
    orderId: string,
    status: string
  ) => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto">
      {/* BACKDROP */}
      <button
        type="button"
        aria-label="Close order details"
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* CENTER */}
      <div className="relative flex min-h-full items-center justify-center p-4 py-8 sm:p-8">
        <div className="relative flex max-h-[calc(100vh-64px)] w-full max-w-[1100px] flex-col overflow-hidden rounded-[30px] bg-[#f3f0e9] shadow-[0_30px_100px_rgba(0,0,0,0.25)]">
          {/* HEADER */}
          <div className="flex shrink-0 items-center justify-between border-b border-black/[0.07] bg-white px-5 py-5 sm:px-8">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#9c8250]">
                Order Details
              </p>

              <div className="mt-1.5 flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-semibold tracking-[-0.04em] sm:text-2xl">
                  #{order.order_number}
                </h2>

                <span
                  className={`rounded-full border px-2.5 py-1 text-[8px] font-bold ${statusClass(
                    order.order_status
                  )}`}
                >
                  {formatStatus(
                    order.order_status
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onEdit}
                className="flex h-10 items-center gap-2 rounded-full bg-[#171512] px-4 text-[9px] font-bold uppercase tracking-[0.13em] text-white transition hover:bg-black"
              >
                <Icon
                  name="edit"
                  size={14}
                />

                Edit Order
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black/45 transition hover:text-black"
              >
                <Icon
                  name="close"
                  size={17}
                />
              </button>
            </div>
          </div>

          {/* BODY */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="grid gap-4 lg:grid-cols-2">
              {/* CUSTOMER */}
              <DetailSection title="Customer">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#171512] text-[#cdb47b]">
                    <Icon
                      name="user"
                      size={19}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {order.customer_name}
                    </p>

                    <p className="mt-1.5 break-all text-[10px] text-black/45">
                      {order.customer_email}
                    </p>

                    <p className="mt-1 text-[10px] text-black/45">
                      {order.customer_phone}
                    </p>
                  </div>
                </div>
              </DetailSection>

              {/* PAYMENT */}
              <DetailSection title="Payment">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold tracking-[-0.04em]">
                      {formatMoney(
                        order.total_amount,
                        order.currency
                      )}
                    </p>

                    <p className="mt-2 text-[9px] text-black/40">
                      Method:{" "}
                      <span className="font-semibold text-black/60">
                        {order.payment_method ||
                          "Not specified"}
                      </span>
                    </p>
                  </div>

                  <StatusSelect
                    value={
                      order.payment_status
                    }
                    options={
                      PAYMENT_STATUSES
                    }
                    disabled={
                      updatingId ===
                      order.id
                    }
                    onChange={(value) =>
                      onPaymentStatusChange(
                        order.id,
                        value
                      )
                    }
                  />
                </div>
              </DetailSection>

              {/* ORDER STATUS */}
              <DetailSection title="Order Status">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold">
                      Fulfilment stage
                    </p>

                    <p className="mt-1 text-[9px] text-black/40">
                      Update the current order
                      stage.
                    </p>
                  </div>

                  <StatusSelect
                    value={
                      order.order_status
                    }
                    options={
                      ORDER_STATUSES
                    }
                    disabled={
                      updatingId ===
                      order.id
                    }
                    onChange={(value) =>
                      onOrderStatusChange(
                        order.id,
                        value
                      )
                    }
                  />
                </div>
              </DetailSection>

              {/* SHIPPING */}
              <DetailSection title="Shipping & Tracking">
                <div className="grid gap-5 sm:grid-cols-3">
                  <Info
                    label="Provider"
                    value={
                      order.shipping_provider ||
                      "Not assigned"
                    }
                  />

                  <Info
                    label="Tracking ID"
                    value={
                      order.tracking_id ||
                      "Not assigned"
                    }
                  />

                  <Info
                    label="Tracking URL"
                    value={
                      order.tracking_url ||
                      "Not available"
                    }
                  />
                </div>
              </DetailSection>

              {/* ADDRESS */}
              <DetailSection
                title="Shipping Address"
                className="lg:col-span-2"
              >
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f3f0e9] text-[#9c8250]">
                    <Icon
                      name="location"
                      size={15}
                    />
                  </div>

                  <div className="text-xs leading-6 text-black/55">
                    <AddressDisplay
                      address={
                        order.shipping_address
                      }
                    />
                  </div>
                </div>
              </DetailSection>

              {/* AMOUNT */}
              <DetailSection title="Amount Breakdown">
                <div className="space-y-3">
                  <AmountRow
                    label="Subtotal"
                    value={formatMoney(
                      order.subtotal,
                      order.currency
                    )}
                  />

                  <AmountRow
                    label="Shipping"
                    value={formatMoney(
                      order.shipping_fee,
                      order.currency
                    )}
                  />

                  <AmountRow
                    label="Discount"
                    value={`− ${formatMoney(
                      order.discount_amount,
                      order.currency
                    )}`}
                  />

                  <div className="border-t border-black/[0.07] pt-4">
                    <AmountRow
                      label="Total"
                      value={formatMoney(
                        order.total_amount,
                        order.currency
                      )}
                      strong
                    />
                  </div>
                </div>
              </DetailSection>

              {/* TIMELINE */}
              <DetailSection title="Order Timeline">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Info
                    label="Created"
                    value={formatDate(
                      order.created_at
                    )}
                  />

                  <Info
                    label="Placed"
                    value={formatDate(
                      order.placed_at
                    )}
                  />

                  <Info
                    label="Updated"
                    value={formatDate(
                      order.updated_at
                    )}
                  />
                </div>
              </DetailSection>

              {/* NOTES */}
              {(order.customer_note ||
                order.admin_note) && (
                <div className="grid gap-4 lg:col-span-2 sm:grid-cols-2">
                  {order.customer_note && (
                    <DetailSection title="Customer Note">
                      <p className="text-[10px] leading-5 text-black/50">
                        {
                          order.customer_note
                        }
                      </p>
                    </DetailSection>
                  )}

                  {order.admin_note && (
                    <DetailSection title="Admin Note">
                      <p className="text-[10px] leading-5 text-black/50">
                        {order.admin_note}
                      </p>
                    </DetailSection>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex shrink-0 items-center justify-between border-t border-black/[0.07] bg-white px-5 py-4 sm:px-8">
            <button
              type="button"
              onClick={onDelete}
              disabled={
                deletingId === order.id
              }
              className="text-[9px] font-bold uppercase tracking-[0.14em] text-red-500 transition hover:text-red-700 disabled:opacity-40"
            >
              {deletingId === order.id
                ? "Deleting..."
                : "Delete Order"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-[#171512] px-6 py-2.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-black"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   EDIT ORDER MODAL
========================================================= */

function EditOrderModal({
  order,
  saving,
  onClose,
  onSave,
}: {
  order: Order;
  saving: boolean;
  onClose: () => void;
  onSave: (
    orderId: string,
    form: EditForm
  ) => Promise<void>;
}) {
  const [form, setForm] = useState<EditForm>(
    () => createEditForm(order)
  );

  function updateField(
    field: keyof EditForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <div className="fixed inset-0 z-[300] overflow-y-auto">
      {/* BACKDROP */}
      <button
        type="button"
        aria-label="Close edit order"
        onClick={() => {
          if (!saving) {
            onClose();
          }
        }}
        className="fixed inset-0 bg-black/65 backdrop-blur-sm"
      />

      {/* CENTER */}
      <div className="relative flex min-h-full items-center justify-center p-4 py-8 sm:p-8">
        <div className="relative flex max-h-[calc(100vh-64px)] w-full max-w-[1180px] flex-col overflow-hidden rounded-[30px] bg-[#f3f0e9] shadow-[0_30px_100px_rgba(0,0,0,0.28)]">
          {/* HEADER */}
          <div className="flex shrink-0 items-center justify-between border-b border-black/[0.07] bg-white px-5 py-5 sm:px-8">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#9c8250]">
                Edit Order
              </p>

              <div className="mt-1.5 flex items-center gap-3">
                <h2 className="text-xl font-semibold tracking-[-0.04em] sm:text-2xl">
                  #{order.order_number}
                </h2>

                <span className="rounded-full bg-[#f3f0e9] px-3 py-1 text-[8px] font-bold text-black/45">
                  Editing
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black/45 transition hover:text-black disabled:opacity-40"
            >
              <Icon
                name="close"
                size={17}
              />
            </button>
          </div>

          {/* FORM BODY */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="space-y-5">
              {/* CUSTOMER */}
              <EditSection
                eyebrow="Customer Information"
                title="Customer"
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    label="Full Name"
                    value={
                      form.customer_name
                    }
                    onChange={(value) =>
                      updateField(
                        "customer_name",
                        value
                      )
                    }
                    required
                  />

                  <FormField
                    label="Email"
                    type="email"
                    value={
                      form.customer_email
                    }
                    onChange={(value) =>
                      updateField(
                        "customer_email",
                        value
                      )
                    }
                    required
                  />

                  <FormField
                    label="Phone"
                    value={
                      form.customer_phone
                    }
                    onChange={(value) =>
                      updateField(
                        "customer_phone",
                        value
                      )
                    }
                    required
                  />
                </div>
              </EditSection>

              {/* ADDRESS */}
              <EditSection
                eyebrow="Delivery"
                title="Shipping Address"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Address Line 1"
                    value={
                      form.address_line_1
                    }
                    onChange={(value) =>
                      updateField(
                        "address_line_1",
                        value
                      )
                    }
                    required
                  />

                  <FormField
                    label="Address Line 2"
                    value={
                      form.address_line_2
                    }
                    onChange={(value) =>
                      updateField(
                        "address_line_2",
                        value
                      )
                    }
                  />

                  <FormField
                    label="Landmark"
                    value={form.landmark}
                    onChange={(value) =>
                      updateField(
                        "landmark",
                        value
                      )
                    }
                  />

                  <FormField
                    label="City"
                    value={form.city}
                    onChange={(value) =>
                      updateField(
                        "city",
                        value
                      )
                    }
                    required
                  />

                  <FormField
                    label="State"
                    value={form.state}
                    onChange={(value) =>
                      updateField(
                        "state",
                        value
                      )
                    }
                    required
                  />

                  <FormField
                    label="Postal Code"
                    value={
                      form.postal_code
                    }
                    onChange={(value) =>
                      updateField(
                        "postal_code",
                        value
                      )
                    }
                    required
                  />

                  <FormField
                    label="Country"
                    value={form.country}
                    onChange={(value) =>
                      updateField(
                        "country",
                        value
                      )
                    }
                  />
                </div>
              </EditSection>

              {/* AMOUNTS */}
              <EditSection
                eyebrow="Order Value"
                title="Amount Details"
              >
                <div className="grid gap-4 md:grid-cols-4">
                  <FormField
                    label="Subtotal"
                    type="number"
                    value={form.subtotal}
                    onChange={(value) =>
                      updateField(
                        "subtotal",
                        value
                      )
                    }
                    min="0"
                  />

                  <FormField
                    label="Shipping Fee"
                    type="number"
                    value={
                      form.shipping_fee
                    }
                    onChange={(value) =>
                      updateField(
                        "shipping_fee",
                        value
                      )
                    }
                    min="0"
                  />

                  <FormField
                    label="Discount"
                    type="number"
                    value={
                      form.discount_amount
                    }
                    onChange={(value) =>
                      updateField(
                        "discount_amount",
                        value
                      )
                    }
                    min="0"
                  />

                  <FormField
                    label="Total Amount"
                    type="number"
                    value={
                      form.total_amount
                    }
                    onChange={(value) =>
                      updateField(
                        "total_amount",
                        value
                      )
                    }
                    min="0"
                    required
                  />
                </div>
              </EditSection>

              {/* PAYMENT + STATUS */}
              <EditSection
                eyebrow="Payment & Fulfilment"
                title="Order Status"
              >
                <div className="grid gap-4 md:grid-cols-4">
                  <FormSelect
                    label="Payment Method"
                    value={
                      form.payment_method
                    }
                    onChange={(value) =>
                      updateField(
                        "payment_method",
                        value
                      )
                    }
                    options={PAYMENT_METHODS}
                    placeholder="Select method"
                  />

                  <FormSelect
                    label="Payment Status"
                    value={
                      form.payment_status
                    }
                    onChange={(value) =>
                      updateField(
                        "payment_status",
                        value
                      )
                    }
                    options={
                      PAYMENT_STATUSES
                    }
                  />

                  <FormSelect
                    label="Order Status"
                    value={
                      form.order_status
                    }
                    onChange={(value) =>
                      updateField(
                        "order_status",
                        value
                      )
                    }
                    options={
                      ORDER_STATUSES
                    }
                  />

                  <FormField
                    label="Currency"
                    value={form.currency}
                    onChange={(value) =>
                      updateField(
                        "currency",
                        value
                      )
                    }
                  />
                </div>
              </EditSection>

              {/* TRACKING */}
              <EditSection
                eyebrow="Shipment"
                title="Shipping & Tracking"
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    label="Shipping Provider"
                    placeholder="e.g. Delhivery"
                    value={
                      form.shipping_provider
                    }
                    onChange={(value) =>
                      updateField(
                        "shipping_provider",
                        value
                      )
                    }
                  />

                  <FormField
                    label="Tracking ID"
                    placeholder="Enter tracking number"
                    value={
                      form.tracking_id
                    }
                    onChange={(value) =>
                      updateField(
                        "tracking_id",
                        value
                      )
                    }
                  />

                  <FormField
                    label="Tracking URL"
                    type="url"
                    placeholder="https://..."
                    value={
                      form.tracking_url
                    }
                    onChange={(value) =>
                      updateField(
                        "tracking_url",
                        value
                      )
                    }
                  />
                </div>
              </EditSection>

              {/* NOTES */}
              <EditSection
                eyebrow="Internal Information"
                title="Notes"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <TextAreaField
                    label="Customer Note"
                    value={
                      form.customer_note
                    }
                    onChange={(value) =>
                      updateField(
                        "customer_note",
                        value
                      )
                    }
                    placeholder="Customer's note..."
                  />

                  <TextAreaField
                    label="Admin Note"
                    value={form.admin_note}
                    onChange={(value) =>
                      updateField(
                        "admin_note",
                        value
                      )
                    }
                    placeholder="Internal admin note..."
                  />
                </div>
              </EditSection>
            </div>
          </div>

          {/* FOOTER */}
          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-black/[0.07] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <p className="text-[9px] text-black/35">
                Changes will be saved directly to
                the order database.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={onClose}
                className="h-11 rounded-full border border-black/10 bg-white px-5 text-[9px] font-bold uppercase tracking-[0.13em] text-black/55 transition hover:text-black disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  onSave(order.id, form)
                }
                className="flex h-11 items-center gap-2 rounded-full bg-[#171512] px-6 text-[9px] font-bold uppercase tracking-[0.13em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon
                  name="save"
                  size={14}
                />

                {saving
                  ? "Saving Changes..."
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   EDIT COMPONENTS
========================================================= */

function EditSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-black/[0.07] bg-white p-5 shadow-[0_6px_24px_rgba(23,21,18,0.025)] sm:p-6">
      <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#9c8250]">
        {eyebrow}
      </p>

      <h3 className="mt-1 text-base font-semibold tracking-[-0.03em]">
        {title}
      </h3>

      <div className="mt-5">
        {children}
      </div>
    </section>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  min?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[8px] font-bold uppercase tracking-[0.15em] text-black/40">
        {label}
        {required && (
          <span className="ml-1 text-red-400">
            *
          </span>
        )}
      </span>

      <input
        type={type}
        value={value}
        min={min}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-11 w-full rounded-xl border border-black/[0.09] bg-[#faf9f6] px-3.5 text-[11px] text-black outline-none transition placeholder:text-black/20 focus:border-[#cdb47b] focus:bg-white"
      />
    </label>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[8px] font-bold uppercase tracking-[0.15em] text-black/40">
        {label}
      </span>

      <div className="relative">
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="h-11 w-full appearance-none rounded-xl border border-black/[0.09] bg-[#faf9f6] px-3.5 pr-9 text-[11px] text-black outline-none transition focus:border-[#cdb47b] focus:bg-white"
        >
          {placeholder && !value && (
            <option value="">
              {placeholder}
            </option>
          )}

          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {formatStatus(option)}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-black/30">
          <Icon
            name="chevron"
            size={13}
          />
        </div>
      </div>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[8px] font-bold uppercase tracking-[0.15em] text-black/40">
        {label}
      </span>

      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        rows={4}
        className="w-full resize-none rounded-xl border border-black/[0.09] bg-[#faf9f6] px-3.5 py-3 text-[11px] leading-5 text-black outline-none transition placeholder:text-black/20 focus:border-[#cdb47b] focus:bg-white"
      />
    </label>
  );
}

/* =========================================================
   DETAIL COMPONENTS
========================================================= */

function DetailSection({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[22px] border border-black/[0.07] bg-white p-5 ${className}`}
    >
      <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#9c8250]">
        {title}
      </p>

      <div className="mt-4">
        {children}
      </div>
    </section>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-black/30">
        {label}
      </p>

      <p className="mt-2 break-all text-[10px] leading-5 text-black/55">
        {value}
      </p>
    </div>
  );
}

function AmountRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-5">
      <p
        className={
          strong
            ? "text-xs font-bold"
            : "text-[10px] text-black/45"
        }
      >
        {label}
      </p>

      <p
        className={
          strong
            ? "text-sm font-bold"
            : "text-[10px] font-semibold text-black/65"
        }
      >
        {value}
      </p>
    </div>
  );
}

function AddressDisplay({
  address,
}: {
  address: ShippingAddress;
}) {
  if (
    !address ||
    typeof address !== "object"
  ) {
    return (
      <p>Address unavailable</p>
    );
  }

  const values = [
    address.fullName,
    address.email,
    address.phone,
    address.address ||
      address.address_line_1,
    address.address_line_2,
    address.landmark,
    address.city,
    address.state,
    address.pincode ||
      address.postal_code,
    address.country,
  ].filter(Boolean);

  if (values.length === 0) {
    return (
      <pre className="whitespace-pre-wrap text-[9px] text-black/40">
        {JSON.stringify(
          address,
          null,
          2
        )}
      </pre>
    );
  }

  return (
    <p>
      {values.map(
        (value, index) => (
          <span
            key={`${String(
              value
            )}-${index}`}
          >
            {String(value)}

            {index <
              values.length - 1 && (
              <br />
            )}
          </span>
        )
      )}
    </p>
  );
}

/* =========================================================
   STATES
========================================================= */

function LoadingState() {
  return (
    <div className="flex min-h-[420px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3f0e9]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/10 border-t-[#171512]" />
        </div>

        <p className="mt-4 text-xs font-semibold">
          Loading orders
        </p>

        <p className="mt-1 text-[9px] text-black/35">
          Fetching the latest order data...
        </p>
      </div>
    </div>
  );
}

function EmptyState({
  hasOrders,
}: {
  hasOrders: boolean;
}) {
  return (
    <div className="flex min-h-[420px] items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#f3f0e9] text-black/30">
          <Icon
            name="shopping"
            size={25}
          />
        </div>

        <p className="mt-5 text-base font-semibold">
          {hasOrders
            ? "No matching orders"
            : "No orders yet"}
        </p>

        <p className="mt-2 text-[10px] leading-5 text-black/35">
          {hasOrders
            ? "Try changing your search or filters to find another order."
            : "Orders created through your storefront will appear here automatically."}
        </p>
      </div>
    </div>
  );
}