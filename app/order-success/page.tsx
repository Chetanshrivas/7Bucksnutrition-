"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  ReceiptPrinter,
  type ReceiptPrinterStage,
} from "../../components/ReceiptPrinter";

import { useAuth } from "../../components/auth/AuthProvider";
import { supabase } from "../../lib/supabase";

type OrderSuccessData = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: Record<string, unknown>;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  payment_method: string | null;
  payment_status: string;
  order_status: string;
  created_at: string;
};

type OrderItem = {
  id: string;
  product_name: string;
  brand_name: string;
  sku: string;
  flavor: string | null;
  size: string | null;
  servings: number | null;
  unit_price: number;
  quantity: number;
  total_price: number;
  product_image_url: string | null;
};

function HomeIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m3 10 9-7 9 7" />
      <path d="M5 9v11h14V9" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}

function formatPrice(value: number, currency = "INR") {
  if (currency === "INR") {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return `${currency} ${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getPaymentLabel(paymentMethod: string | null) {
  if (!paymentMethod) return "Online Payment";

  const normalized = paymentMethod.toLowerCase();

  if (normalized === "cod") {
    return "Cash on Delivery";
  }

  if (
    normalized === "online" ||
    normalized === "online_payment" ||
    normalized === "razorpay"
  ) {
    return "Online Payment";
  }

  return paymentMethod;
}

function getShippingAddress(address: Record<string, unknown>) {
  const fullName =
    typeof address.fullName === "string"
      ? address.fullName
      : typeof address.full_name === "string"
        ? address.full_name
        : "";

  const line1 =
    typeof address.address === "string"
      ? address.address
      : typeof address.address_line_1 === "string"
        ? address.address_line_1
        : "";

  const line2 =
    typeof address.address_line_2 === "string"
      ? address.address_line_2
      : "";

  const landmark =
    typeof address.landmark === "string"
      ? address.landmark
      : "";

  const city =
    typeof address.city === "string"
      ? address.city
      : "";

  const state =
    typeof address.state === "string"
      ? address.state
      : "";

  const pincode =
    typeof address.pincode === "string"
      ? address.pincode
      : typeof address.postal_code === "string"
        ? address.postal_code
        : "";

  const phone =
    typeof address.phone === "string"
      ? address.phone
      : "";

  const email =
    typeof address.email === "string"
      ? address.email
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

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const orderId = searchParams.get("order");

  const [order, setOrder] =
    useState<OrderSuccessData | null>(null);

  const [items, setItems] = useState<OrderItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [stage, setStage] =
    useState<ReceiptPrinterStage>("processing");

  useEffect(() => {
    if (authLoading) return;

    if (!user || !orderId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadOrder() {
      setLoading(true);
      setStage("processing");

      const [orderResult, itemsResult] = await Promise.all([
        supabase
          .from("orders")
          .select(
            `
              id,
              order_number,
              customer_name,
              customer_email,
              customer_phone,
              shipping_address,
              subtotal,
              shipping_fee,
              discount_amount,
              total_amount,
              currency,
              payment_method,
              payment_status,
              order_status,
              created_at
            `
          )
          .eq("id", orderId)
          .eq("customer_id", user!.id)
          .maybeSingle(),

        supabase
          .from("order_items")
          .select(
            `
              id,
              product_name,
              brand_name,
              sku,
              flavor,
              size,
              servings,
              unit_price,
              quantity,
              total_price,
              product_image_url
            `
          )
          .eq("order_id", orderId)
          .order("created_at", { ascending: true }),
      ]);

      if (cancelled) return;

      if (orderResult.error) {
        console.error(
          "Failed to load successful order:",
          orderResult.error
        );

        setOrder(null);
        setItems([]);
        setLoading(false);
        return;
      }

      if (itemsResult.error) {
        console.error(
          "Failed to load order items:",
          itemsResult.error
        );
      }

      setOrder(
        orderResult.data as OrderSuccessData | null
      );

      setItems(
        (itemsResult.data ?? []) as OrderItem[]
      );

      setLoading(false);
    }

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, orderId]);

  useEffect(() => {
    if (!order || loading) return;

    const printingTimer = window.setTimeout(() => {
      setStage("printing");
    }, 650);

    const completeTimer = window.setTimeout(() => {
      setStage("complete");
    }, 2700);

    return () => {
      window.clearTimeout(printingTimer);
      window.clearTimeout(completeTimer);
    };
  }, [order, loading]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-ivory px-5 pt-32 text-espresso">
        <section className="mx-auto flex max-w-xl flex-col items-center text-center">
          <div className="h-16 w-16 animate-pulse rounded-full bg-espresso/10" />

          <div className="mt-7 h-8 w-64 animate-pulse rounded-lg bg-espresso/10" />

          <div className="mt-4 h-4 w-80 max-w-full animate-pulse rounded bg-espresso/10" />
        </section>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-ivory px-5 pt-32 text-espresso">
        <section className="mx-auto flex max-w-xl flex-col items-center text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-clay">
            Seven Bucks Nutrition
          </p>

          <h1 className="mt-5 font-serif text-4xl italic tracking-[-0.04em] sm:text-5xl">
            Order not found
          </h1>

          <p className="mt-4 max-w-md text-sm leading-7 text-espresso/50">
            We couldn't find this order in your account.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/account/orders"
              className="inline-flex h-12 items-center justify-center rounded-full bg-espresso px-7 text-[10px] font-bold uppercase tracking-[0.18em] text-ivory"
            >
              View Orders
            </Link>

            <Link
              href="/shop"
              className="inline-flex h-12 items-center justify-center rounded-full border border-border px-7 text-[10px] font-bold uppercase tracking-[0.18em] text-espresso"
            >
              Continue Shopping
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const shippingAddress = getShippingAddress(
    order.shipping_address
  );

  const itemCount = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <main className="min-h-screen bg-ivory px-5 pb-24 pt-28 text-espresso sm:px-8 sm:pt-36">
      <section className="mx-auto max-w-xl">

        {/* RECEIPT PRINTER */}
        <ReceiptPrinter.Root
          stage={stage}
          feedMotion="stepped"
          className="mx-auto"
        >
          <ReceiptPrinter.Machine>
            <ReceiptPrinter.Header>
              <div className="flex size-6 items-center justify-center overflow-hidden rounded-md">
                <img
                  src="/logo/seven-bucks-logo.webp"
                  alt=""
                  className="size-6 object-contain"
                />
              </div>

              <Link
                href="/"
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-3 text-[8px] font-bold uppercase tracking-[0.12em] text-espresso transition hover:bg-white"
              >
                <HomeIcon />
                Home
              </Link>
            </ReceiptPrinter.Header>

            <ReceiptPrinter.Screen>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-[0.14em] text-grayscale-8">
                      7 Bucks Nutrition
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold">
                      Order #{order.order_number}
                    </p>

                    <p className="mt-1 text-[10px] text-grayscale-8">
                      {itemCount}{" "}
                      {itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>

                  <strong className="shrink-0 text-sm">
                    {formatPrice(
                      order.total_amount,
                      order.currency
                    )}
                  </strong>
                </div>

                <ReceiptPrinter.Status>
                  {stage === "processing"
                    ? "Processing your order"
                    : stage === "printing"
                      ? "Printing your receipt"
                      : "Order complete"}
                </ReceiptPrinter.Status>
              </div>
            </ReceiptPrinter.Screen>
          </ReceiptPrinter.Machine>

          <ReceiptPrinter.Output>
            <ReceiptPrinter.Paper>
              <div className="text-[11px] leading-5">

                <div className="text-center">
                  <h1 className="text-lg font-bold tracking-[0.08em]">
                    7 BUCKS
                  </h1>

                  <p className="text-[9px] tracking-[0.18em]">
                    NUTRITION
                  </p>

                  <p className="mt-3 text-[9px]">
                    ORDER RECEIPT
                  </p>
                </div>

                <div className="my-5 border-t border-dashed border-black/40" />

                <div className="space-y-1">
                  <div className="flex justify-between gap-4">
                    <span>ORDER</span>
                    <span className="font-bold">
                      #{order.order_number}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>DATE</span>
                    <span>
                      {formatDate(order.created_at)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>PAYMENT</span>
                    <span>
                      {getPaymentLabel(
                        order.payment_method
                      )}
                    </span>
                  </div>
                </div>

                <div className="my-5 border-t border-dashed border-black/40" />

                <div>
                  <p className="mb-3 text-[9px] font-bold tracking-[0.15em]">
                    ITEMS
                  </p>

                  {items.length > 0 ? (
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.id}>
                          <div className="flex justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-bold">
                                {item.product_name}
                              </p>

                              {item.brand_name ? (
                                <p className="text-[9px] opacity-65">
                                  {item.brand_name}
                                </p>
                              ) : null}

                              {(item.flavor ||
                                item.size ||
                                item.servings) ? (
                                <p className="text-[9px] opacity-65">
                                  {[
                                    item.flavor,
                                    item.size,
                                    item.servings
                                      ? `${item.servings} servings`
                                      : null,
                                  ]
                                    .filter(Boolean)
                                    .join(" • ")}
                                </p>
                              ) : null}

                              <p className="text-[9px] opacity-65">
                                {item.quantity} ×{" "}
                                {formatPrice(
                                  item.unit_price,
                                  order.currency
                                )}
                              </p>
                            </div>

                            <span className="shrink-0 font-bold">
                              {formatPrice(
                                item.total_price,
                                order.currency
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[9px] opacity-60">
                      Order items unavailable.
                    </p>
                  )}
                </div>

                <div className="my-5 border-t border-dashed border-black/40" />

                <div className="space-y-1.5">
                  <div className="flex justify-between gap-4">
                    <span>SUBTOTAL</span>
                    <span>
                      {formatPrice(
                        order.subtotal,
                        order.currency
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span>SHIPPING</span>
                    <span>
                      {order.shipping_fee > 0
                        ? formatPrice(
                            order.shipping_fee,
                            order.currency
                          )
                        : "FREE"}
                    </span>
                  </div>

                  {order.discount_amount > 0 ? (
                    <div className="flex justify-between gap-4">
                      <span>DISCOUNT</span>
                      <span>
                        -
                        {formatPrice(
                          order.discount_amount,
                          order.currency
                        )}
                      </span>
                    </div>
                  ) : null}

                  <div className="my-3 border-t border-black/40" />

                  <div className="flex justify-between gap-4 text-sm font-bold">
                    <span>TOTAL</span>
                    <span>
                      {formatPrice(
                        order.total_amount,
                        order.currency
                      )}
                    </span>
                  </div>
                </div>

                <div className="my-5 border-t border-dashed border-black/40" />

                <div>
                  <p className="mb-2 text-[9px] font-bold tracking-[0.15em]">
                    CUSTOMER
                  </p>

                  <p className="font-bold">
                    {order.customer_name}
                  </p>

                  <p className="text-[9px]">
                    {order.customer_email}
                  </p>

                  <p className="text-[9px]">
                    {order.customer_phone}
                  </p>
                </div>

                <div className="my-5 border-t border-dashed border-black/40" />

                <div>
                  <p className="mb-2 text-[9px] font-bold tracking-[0.15em]">
                    DELIVERY ADDRESS
                  </p>

                  {shippingAddress.fullName ? (
                    <p className="font-bold">
                      {shippingAddress.fullName}
                    </p>
                  ) : null}

                  {shippingAddress.line1 ? (
                    <p>{shippingAddress.line1}</p>
                  ) : null}

                  {shippingAddress.line2 ? (
                    <p>{shippingAddress.line2}</p>
                  ) : null}

                  {shippingAddress.landmark ? (
                    <p>
                      Landmark:{" "}
                      {shippingAddress.landmark}
                    </p>
                  ) : null}

                  {(shippingAddress.city ||
                    shippingAddress.state ||
                    shippingAddress.pincode) ? (
                    <p>
                      {[
                        shippingAddress.city,
                        shippingAddress.state,
                        shippingAddress.pincode,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  ) : null}

                  {shippingAddress.phone ? (
                    <p className="mt-1">
                      Phone: {shippingAddress.phone}
                    </p>
                  ) : null}
                </div>

                <div className="my-6 border-t border-dashed border-black/40" />

                <div className="text-center">
                  <p className="font-bold">
                    THANK YOU FOR YOUR ORDER
                  </p>

                  <p className="mt-1 text-[9px] opacity-65">
                    We appreciate your support.
                  </p>
                </div>
              </div>
            </ReceiptPrinter.Paper>
          </ReceiptPrinter.Output>
        </ReceiptPrinter.Root>

        {/* COMPACT CONFIRMATION + ACTIONS */}
        <div className="mt-8 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-clay">
            Seven Bucks Nutrition
          </p>

          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-espresso/55">
            Your order has been placed successfully. Your receipt is ready above.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href="/account/orders"
              className="flex h-13 items-center justify-center rounded-xl bg-espresso px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-ivory transition hover:bg-espresso/90"
            >
              View My Orders
            </Link>

            <Link
              href="/account"
              className="flex h-13 items-center justify-center rounded-xl border border-border bg-white/40 px-5 py-4 text-[10px] font-bold uppercase tracking-[0.18em] text-espresso transition hover:border-espresso/30 hover:bg-white/70"
            >
              Go to Account
            </Link>
          </div>

          <Link
            href="/shop"
            className="mt-4 inline-flex h-10 items-center justify-center px-4 text-[9px] font-bold uppercase tracking-[0.18em] text-espresso/40 transition hover:text-espresso"
          >
            Continue Shopping
          </Link>
        </div>

      </section>
    </main>
  );
}