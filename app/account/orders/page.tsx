"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "../../../components/auth/AuthProvider";
import { supabase } from "../../../lib/supabase";

type OrderItem = {
  id: string;
  product_name: string;
  brand_name: string;
  flavor: string | null;
  size: string | null;
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
  total_amount: number;
  subtotal: number;
  shipping_fee: number;
  currency: string;
  tracking_id: string | null;
  tracking_url: string | null;
  created_at: string;
  order_items: OrderItem[];
};

function PackageIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function ChevronDown({ open }: { open: boolean }) {
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
      className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 18V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h1" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62L18.3 8.38A1 1 0 0 0 17.5 8H14v10h1" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  );
}

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

function statusColor(status: string) {
  if (status === "delivered") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "cancelled" || status === "returned")
    return "bg-red-50 text-red-600 border-red-200";
  if (status === "shipped" || status === "out_for_delivery")
    return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-[#a27d37]/10 text-[#a27d37] border-[#a27d37]/25";
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    const currentUser = user;
    let cancelled = false;

    async function loadOrders() {
      setLoading(true);

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
            id,
            order_number,
            order_status,
            payment_status,
            total_amount,
            subtotal,
            shipping_fee,
            currency,
            tracking_id,
            tracking_url,
            created_at,
            order_items (
              id,
              product_name,
              brand_name,
              flavor,
              size,
              quantity,
              unit_price,
              total_price,
              product_image_url
            )
          `
        )
        .eq("customer_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (error) {
        console.error("Failed to load orders:", error);
        setOrders([]);
      } else {
        setOrders((data ?? []) as unknown as Order[]);
      }

      setLoading(false);
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading, router]);

  const formatPrice = (value: number, currency = "INR") =>
    currency === "INR" ? `₹${value.toLocaleString("en-IN")}` : `${currency} ${value.toLocaleString("en-IN")}`;

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  if (authLoading || !user || loading) {
    return (
      <main className="min-h-screen bg-[#f5f2eb] px-5 pt-32 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="h-3 w-24 animate-pulse rounded-full bg-black/10" />
          <div className="mt-4 h-10 w-56 animate-pulse rounded-xl bg-black/10" />

          <div className="mt-10 space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-[24px] bg-white/60" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main className="min-h-screen bg-[#f5f2eb] px-5 pt-32 text-[#171512] sm:px-8">
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

          <h1 className="mt-6 font-serif text-3xl italic tracking-[-0.02em] sm:text-4xl">
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

  return (
    <main className="min-h-screen bg-[#f5f2eb] px-5 pb-24 pt-28 text-[#171512] sm:px-8 sm:pt-32">
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

            <h1 className="mt-3 font-serif text-4xl italic tracking-[-0.02em] sm:text-5xl">
              My Orders
            </h1>

            <p className="mt-4 text-sm leading-6 text-white/45">
              {orders.length} {orders.length === 1 ? "order" : "orders"} placed with Seven Bucks Nutrition.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedId === order.id;
            const itemCount = order.order_items.reduce((sum, item) => sum + item.quantity, 0);
            const previewItem = order.order_items[0];

            return (
              <div
                key={order.id}
                className={`group overflow-hidden rounded-[24px] border bg-white transition duration-300 hover:-translate-y-0.5 ${
                  isExpanded ? "border-[#cdb47b]/50 shadow-[0_20px_60px_rgba(162,125,55,0.12)]" : "border-black/[0.08] hover:border-[#a27d37]/25 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="flex w-full flex-col gap-4 p-5 text-left sm:flex-row sm:items-center sm:justify-between sm:p-6"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#f5f2eb]">
                      {previewItem?.product_image_url ? (
                        <img
                          src={previewItem.product_image_url}
                          alt={previewItem.product_name}
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-black/20">
                          <PackageIcon />
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-black/30">
                        Order
                      </p>
                      <p
                        className="mt-1 inline-block max-w-[200px] truncate rounded-md bg-black/[0.04] px-2 py-0.5 font-mono text-[11px] font-semibold tracking-tight text-[#171512] sm:max-w-[260px]"
                        title={order.order_number}
                      >
                        #{order.order_number}
                      </p>

                      <p className="mt-1 text-xs text-black/40">
                        {formatDate(order.created_at)} · {itemCount} {itemCount === 1 ? "item" : "items"}
                      </p>

                      <span
                        className={`mt-2 inline-flex items-center rounded-full border px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] ${statusColor(
                          order.order_status
                        )}`}
                      >
                        {ORDER_STATUS_LABELS[order.order_status] || order.order_status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
                    <p className="text-lg font-bold">{formatPrice(order.total_amount, order.currency)}</p>

                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/[0.04] text-black/50 transition group-hover:bg-[#a27d37]/10 group-hover:text-[#a27d37]">
                      <ChevronDown open={isExpanded} />
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-black/[0.07] bg-[#faf9f6] p-5 sm:p-6">
                    <div className="space-y-3">
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white">
                            {item.product_image_url ? (
                              <img
                                src={item.product_image_url}
                                alt={item.product_name}
                                className="h-full w-full object-contain p-1.5"
                              />
                            ) : null}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold">{item.product_name}</p>

                            <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-black/40">
                              {[item.flavor, item.size].filter(Boolean).join(" · ") || item.brand_name}
                              {" · "}Qty {item.quantity}
                            </p>
                          </div>

                          <p className="shrink-0 text-xs font-bold">
                            {formatPrice(item.total_price, order.currency)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 space-y-2 border-t border-black/[0.07] pt-4 text-xs">
                      <div className="flex justify-between text-black/50">
                        <span>Subtotal</span>
                        <span>{formatPrice(order.subtotal, order.currency)}</span>
                      </div>

                      <div className="flex justify-between text-black/50">
                        <span>Shipping</span>
                        <span>
                          {order.shipping_fee > 0 ? formatPrice(order.shipping_fee, order.currency) : "Free"}
                        </span>
                      </div>

                      <div className="flex justify-between pt-1 text-sm font-bold">
                        <span>Total</span>
                        <span>{formatPrice(order.total_amount, order.currency)}</span>
                      </div>
                    </div>

                    {order.tracking_id && (
                      <div className="mt-5 flex items-center justify-between rounded-2xl border border-[#a27d37]/20 bg-[#a27d37]/[0.06] px-4 py-3">
                        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#a27d37]">
                          <TruckIcon />
                          Tracking: {order.tracking_id}
                        </div>

                        {order.tracking_url && (
                          <a
                            href={order.tracking_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#a27d37] underline underline-offset-2"
                          >
                            Track
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}