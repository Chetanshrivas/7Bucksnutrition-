"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useCart } from "../../components/cart/CartProvider";
import { useAuth } from "../../components/auth/AuthProvider";
import { supabase } from "../../lib/supabase";

type FormData = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
};

const INITIAL_FORM: FormData = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
};

type PlaceOrderResponse = {
  success: boolean;
  order_id: string;
  order_number: string;
  total_amount: number;
  currency: string;
};

// Shared classes: text-base on mobile + text-sm from sm: up.
// This is the fix for the classic iOS Safari "page auto-zooms
// when you tap an input" bug — Safari zooms in on any input
// whose computed font-size is below 16px. Keeping it at 16px
// (text-base) on small screens, and only shrinking to 14px on
// sm:+ screens, makes the whole form feel "responsive" on phones.
const inputBase =
  "w-full rounded-xl border border-border bg-ivory px-4 text-base sm:text-sm outline-none transition placeholder:text-espresso/25 focus:border-espresso/40";

export default function CheckoutPage() {
  const router = useRouter();

  const { user, loading: authLoading } = useAuth();
  const { items, subtotal, clearCart } = useCart();

  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectingToLogin, setRedirectingToLogin] = useState(false);

  const shipping = useMemo(() => {
    return subtotal >= 999 ? 0 : 99;
  }, [subtotal]);

  const total = subtotal + shipping;

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setRedirectingToLogin(true);

      toast.error("Please login first to proceed to checkout.");

      const timer = window.setTimeout(() => {
        router.replace("/login");
      }, 250);

      return () => {
        window.clearTimeout(timer);
      };
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;

    setForm((current) => ({
      ...current,
      fullName:
        current.fullName ||
        (typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : ""),
      email: current.email || user.email || "",
      phone:
        current.phone ||
        (typeof user.user_metadata?.phone === "string"
          ? user.user_metadata.phone
          : ""),
    }));
  }, [user]);

  const updateField = (
    field: keyof FormData,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const formatPrice = (value: number) =>
    `₹${value.toLocaleString("en-IN")}`;

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (authLoading) {
      toast.error("Please wait while your account is loading.");
      return;
    }

    if (!user) {
      toast.error("Please login first to proceed to checkout.");
      router.replace("/login");
      return;
    }

    if (items.length === 0) {
      toast.error("Your bag is empty.");
      router.replace("/shop");
      return;
    }

    if (form.pincode.length !== 6) {
      toast.error("Please enter a valid 6-digit pincode.");
      return;
    }

    if (form.phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const shippingAddress = {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        landmark: form.landmark.trim() || null,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
      };

      /*
       * Cart identity:
       *
       * Simple product:
       *   variantId = product.id
       *   isVariant = false
       *
       * Variable product:
       *   variantId = product_variants.id
       *   isVariant = true
       *
       * For a simple product, the same variantId is the
       * actual product ID and is sent as productId.
       *
       * For a variable product, place_order() resolves
       * productId from product_variants using variantId.
       */
      const orderItems = items.map((item) => {
        const isVariant = item.isVariant !== false;

        return {
          productId: isVariant
            ? null
            : item.variantId,

          variantId: isVariant
            ? item.variantId
            : null,

          isVariant,

          productName: item.productName,
          brand: item.brand,
          sku: item.sku,
          flavor: item.flavor ?? null,
          size: item.size ?? null,
          servings: item.servings ?? null,
          price: Number(item.price),
          quantity: Number(item.quantity),
          image: item.image ?? null,
        };
      });

      const { data, error } = await supabase.rpc(
        "place_order",
        {
          p_customer_id: user.id,
          p_customer_name: form.fullName.trim(),
          p_customer_email: form.email.trim(),
          p_customer_phone: form.phone.trim(),
          p_shipping_address: shippingAddress,
          p_subtotal: subtotal,
          p_shipping_fee: shipping,
          p_total_amount: total,
          p_currency: "INR",
          p_items: orderItems,
        }
      );

      if (error) {
        console.error("Place order error:", error);
        throw error;
      }

      const result = data as PlaceOrderResponse;

      if (
        !result?.success ||
        !result.order_id ||
        !result.order_number
      ) {
        throw new Error("Invalid order response.");
      }

      clearCart();

      toast.success("Order placed successfully.");

      router.replace(
        `/order-success?order=${encodeURIComponent(
          result.order_id
        )}`
      );
    } catch (error) {
      console.error("Order placement failed:", error);

      const message =
        error instanceof Error ? error.message : "";

      if (
        message.includes("INSUFFICIENT_STOCK") ||
        message.includes("STOCK_CHANGED")
      ) {
        toast.error(
          "Some item is out of stock. Please update your bag."
        );
      } else if (
        message.includes("INVENTORY_NOT_FOUND")
      ) {
        toast.error(
          "Inventory information is missing for an item."
        );
      } else if (
        message.includes("VARIANT_NOT_FOUND")
      ) {
        toast.error(
          "The selected product variant is no longer available."
        );
      } else if (
        message.includes("PRODUCT_NOT_FOUND")
      ) {
        toast.error(
          "This product is no longer available."
        );
      } else if (
        message.includes("VARIANT_REQUIRED")
      ) {
        toast.error(
          "Please select a valid product variant."
        );
      } else if (
        message.includes("PRODUCT_REQUIRED")
      ) {
        toast.error(
          "Product information is missing. Please add the item again."
        );
      } else if (
        message.includes("INVALID_QUANTITY")
      ) {
        toast.error(
          "Invalid product quantity. Please update your bag."
        );
      } else if (
        message.includes("CUSTOMER_NOT_FOUND")
      ) {
        toast.error(
          "Your account could not be verified. Please login again."
        );

        router.replace("/login");
      } else if (
        message.includes("AUTH_REQUIRED") ||
        message.includes("UNAUTHORIZED_CUSTOMER")
      ) {
        toast.error(
          "Your session has expired. Please login again."
        );

        router.replace("/login");
      } else if (
        message.includes("EMPTY_CART")
      ) {
        toast.error("Your bag is empty.");
      } else {
        toast.error(
          "Unable to place your order. Please try again."
        );
      }

      setIsSubmitting(false);
    }
  };

  if (
    authLoading ||
    redirectingToLogin ||
    !user
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ivory px-5 text-espresso">
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-clay">
            Seven Bucks Nutrition
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <span className="h-2 w-2 animate-pulse rounded-full bg-clay" />

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-espresso/50">
              {authLoading
                ? "Checking your account..."
                : "Redirecting to login..."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen overflow-x-hidden bg-ivory text-espresso">
        <section className="mx-auto flex min-h-[75vh] max-w-[900px] flex-col items-center justify-center px-5 pt-24 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-clay">
            Seven Bucks Nutrition
          </p>

          <h1 className="mt-5 break-words font-serif text-4xl italic leading-tight tracking-[-0.03em] sm:text-6xl">
            Your bag is empty.
          </h1>

          <p className="mt-5 max-w-md text-sm leading-7 text-espresso/50">
            Add a product to your bag before continuing
            to checkout.
          </p>

          <Link
            href="/shop"
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-espresso px-7 text-[10px] font-bold uppercase tracking-[0.18em] text-ivory transition hover:bg-espresso/90"
          >
            Continue Shopping
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-ivory text-espresso">
      <section className="border-b border-border px-5 pb-8 pt-24 sm:px-8 sm:pb-10 sm:pt-28 lg:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-wrap items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-espresso/40">
            <Link
              href="/cart"
              className="transition hover:text-espresso"
            >
              Bag
            </Link>

            <span>/</span>

            <span className="text-espresso/70">
              Checkout
            </span>
          </div>

          <div className="mt-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-clay">
              Seven Bucks Nutrition
            </p>

            <h1 className="mt-3 break-words text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-7xl">
              Checkout
            </h1>

            <p className="mt-4 max-w-lg text-sm leading-7 text-espresso/50">
              Enter your delivery details carefully. Your
              order information will be used for fulfilment
              and delivery.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-16">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16"
        >
          <div className="space-y-6 sm:space-y-8">
            <section className="rounded-2xl border border-border bg-card p-4 sm:p-5 md:p-7">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-clay">
                  01 — Contact
                </p>

                <h2 className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">
                  Your details
                </h2>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.16em] text-espresso/55">
                    Full Name
                  </span>

                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={form.fullName}
                    onChange={(event) =>
                      updateField(
                        "fullName",
                        event.target.value
                      )
                    }
                    placeholder="Your full name"
                    className={`h-12 ${inputBase}`}
                  />
                </label>

                <label>
                  <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.16em] text-espresso/55">
                    Email
                  </span>

                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(event) =>
                      updateField(
                        "email",
                        event.target.value
                      )
                    }
                    placeholder="you@example.com"
                    className={`h-12 ${inputBase}`}
                  />
                </label>

                <label>
                  <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.16em] text-espresso/55">
                    Phone
                  </span>

                  <input
                    type="tel"
                    required
                    inputMode="numeric"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(event) =>
                      updateField(
                        "phone",
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10)
                      )
                    }
                    placeholder="10-digit mobile number"
                    className={`h-12 ${inputBase}`}
                  />
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-4 sm:p-5 md:p-7">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-clay">
                  02 — Delivery
                </p>

                <h2 className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">
                  Delivery address
                </h2>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.16em] text-espresso/55">
                    Address
                  </span>

                  <textarea
                    required
                    autoComplete="street-address"
                    value={form.address}
                    onChange={(event) =>
                      updateField(
                        "address",
                        event.target.value
                      )
                    }
                    placeholder="House / Flat / Street / Area"
                    rows={3}
                    className={`resize-none py-3 ${inputBase}`}
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.16em] text-espresso/55">
                    Landmark
                    <span className="ml-1 font-normal normal-case tracking-normal text-espresso/30">
                      Optional
                    </span>
                  </span>

                  <input
                    type="text"
                    autoComplete="off"
                    value={form.landmark}
                    onChange={(event) =>
                      updateField(
                        "landmark",
                        event.target.value
                      )
                    }
                    placeholder="Nearby landmark"
                    className={`h-12 ${inputBase}`}
                  />
                </label>

                <label>
                  <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.16em] text-espresso/55">
                    City
                  </span>

                  <input
                    type="text"
                    required
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={(event) =>
                      updateField(
                        "city",
                        event.target.value
                      )
                    }
                    placeholder="City"
                    className={`h-12 ${inputBase}`}
                  />
                </label>

                <label>
                  <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.16em] text-espresso/55">
                    State
                  </span>

                  <input
                    type="text"
                    required
                    autoComplete="address-level1"
                    value={form.state}
                    onChange={(event) =>
                      updateField(
                        "state",
                        event.target.value
                      )
                    }
                    placeholder="State"
                    className={`h-12 ${inputBase}`}
                  />
                </label>

                <label>
                  <span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.16em] text-espresso/55">
                    Pincode
                  </span>

                  <input
                    type="text"
                    required
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={6}
                    value={form.pincode}
                    onChange={(event) =>
                      updateField(
                        "pincode",
                        event.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6)
                      )
                    }
                    placeholder="6-digit pincode"
                    className={`h-12 ${inputBase}`}
                  />
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-4 sm:p-5 md:p-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-clay">
                03 — Payment
              </p>

              <h2 className="mt-2 text-lg font-semibold tracking-tight sm:text-xl">
                Payment method
              </h2>

              <div className="mt-6 rounded-xl border border-espresso bg-espresso p-4 text-ivory">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-gold">
                    <div className="h-2 w-2 rounded-full bg-gold" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      Online Payment
                    </p>

                    <p className="mt-1 text-xs leading-5 text-ivory/55">
                      Secure online payment will be
                      connected with Razorpay later.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-card p-5 sm:p-6 lg:sticky lg:top-28">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-clay">
              Order Summary
            </p>

            <div className="mt-6 space-y-4">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex gap-3"
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-sand">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt=""
                        className="h-full w-full object-contain p-1"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-[8px] text-espresso/25">
                          {item.brand}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">
                      {item.productName}
                    </p>

                    <p className="mt-1 text-[9px] uppercase tracking-[0.08em] text-espresso/40">
                      {item.size ?? "Standard"}
                      {item.flavor
                        ? ` · ${item.flavor}`
                        : ""}
                    </p>

                    <p className="mt-1 text-[10px] text-espresso/45">
                      Qty {item.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 text-xs font-semibold">
                    {formatPrice(
                      item.price * item.quantity
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className="my-6 border-t border-border" />

            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-espresso/50">
                  Subtotal
                </span>

                <span className="font-semibold">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-espresso/50">
                  Shipping
                </span>

                <span className="font-semibold">
                  {shipping === 0
                    ? "FREE"
                    : formatPrice(shipping)}
                </span>
              </div>
            </div>

            <div className="my-6 border-t border-border" />

            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-espresso/40">
                  Total
                </p>

                <p className="mt-1 break-words text-2xl font-bold tracking-tight">
                  {formatPrice(total)}
                </p>
              </div>

              <span className="shrink-0 text-[9px] uppercase tracking-[0.15em] text-espresso/35">
                INR
              </span>
            </div>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                authLoading ||
                !user
              }
              className="mt-7 flex h-14 w-full items-center justify-center rounded-xl bg-espresso px-5 text-[10px] font-bold uppercase tracking-[0.2em] text-ivory transition hover:bg-espresso/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Placing Order..."
                : "Place Order"}
            </button>

            <Link
              href="/cart"
              className="mt-4 flex h-12 w-full items-center justify-center rounded-xl border border-border text-[9px] font-bold uppercase tracking-[0.18em] text-espresso/65 transition hover:border-espresso/30 hover:text-espresso"
            >
              Back to Bag
            </Link>

            <p className="mt-6 text-center text-[9px] leading-5 text-espresso/35">
              Secure checkout · Trusted nutrition ·
              Faridabad
            </p>
          </aside>
        </form>
      </section>
    </main>
  );
}