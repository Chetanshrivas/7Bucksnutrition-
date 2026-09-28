"use client";

import Script from "next/script";
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

type CreateOrderResponse = {
  success: boolean;
  key_id: string;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
};

type VerifyPaymentResponse = {
  success: boolean;
  already_processed?: boolean;
  payment_received?: boolean;
  order_id: string | null;
  order_number: string | null;
  payment_status: string;
  order_status: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  payment_captured_at?: string;
  message?: string;
};

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: {
    checkout_type?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  handler: (
    response: RazorpaySuccessResponse
  ) => void | Promise<void>;
};

type RazorpayInstance = {
  open: () => void;
};

type RazorpayConstructor = new (
  options: RazorpayOptions
) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

// Shared classes.
// text-base on mobile prevents iOS Safari input auto-zoom.
const inputBase =
  "w-full rounded-xl border border-border bg-ivory px-4 text-base sm:text-sm outline-none transition placeholder:text-espresso/25 focus:border-espresso/40";

export default function CheckoutPage() {
  const router = useRouter();

  const { user, loading: authLoading } =
    useAuth();

  const {
    items,
    subtotal,
    clearCart,
  } = useCart();

  const [form, setForm] =
    useState<FormData>(INITIAL_FORM);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [
    redirectingToLogin,
    setRedirectingToLogin,
  ] = useState(false);

  const [
    razorpayReady,
    setRazorpayReady,
  ] = useState(false);

  const shipping = useMemo(() => {
    return subtotal >= 999 ? 0 : 99;
  }, [subtotal]);

  const total = subtotal + shipping;

  /*
   * -------------------------------------------------------
   * AUTH REDIRECT
   * -------------------------------------------------------
   */

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setRedirectingToLogin(true);

      toast.error(
        "Please login first to proceed to checkout."
      );

      const timer =
        window.setTimeout(() => {
          router.replace("/login");
        }, 250);

      return () => {
        window.clearTimeout(timer);
      };
    }
  }, [
    authLoading,
    user,
    router,
  ]);

  /*
   * -------------------------------------------------------
   * PREFILL CUSTOMER DETAILS
   * -------------------------------------------------------
   */

  useEffect(() => {
    if (!user) return;

    setForm((current) => ({
      ...current,

      fullName:
        current.fullName ||
        (typeof user.user_metadata
          ?.full_name === "string"
          ? user.user_metadata.full_name
          : ""),

      email:
        current.email ||
        user.email ||
        "",

      phone:
        current.phone ||
        (typeof user.user_metadata
          ?.phone === "string"
          ? user.user_metadata.phone
          : ""),
    }));
  }, [user]);

  /*
   * -------------------------------------------------------
   * FORM FIELD UPDATE
   * -------------------------------------------------------
   */

  const updateField = (
    field: keyof FormData,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /*
   * -------------------------------------------------------
   * PRICE FORMAT
   * -------------------------------------------------------
   */

  const formatPrice = (
    value: number
  ) =>
    `₹${value.toLocaleString(
      "en-IN"
    )}`;

  /*
   * -------------------------------------------------------
   * LOAD RAZORPAY
   * -------------------------------------------------------
   */

  const handleRazorpayLoad = () => {
    setRazorpayReady(
      Boolean(window.Razorpay)
    );
  };

  /*
   * Razorpay is loaded through next/script afterInteractive.
   * On some browsers/autofill flows, the script can finish
   * loading without the React onLoad state update being observed
   * at the exact same moment. Keep the readiness state synced
   * until the global constructor is actually available.
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.Razorpay) {
      setRazorpayReady(true);
      return;
    }

    const interval = window.setInterval(() => {
      if (window.Razorpay) {
        setRazorpayReady(true);
        window.clearInterval(interval);
      }
    }, 250);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  /*
   * -------------------------------------------------------
   * OPEN RAZORPAY CHECKOUT
   * -------------------------------------------------------
   */

  const openRazorpayCheckout = async (
    createOrder: CreateOrderResponse,
    shippingAddress: FormData,
    checkoutItems: Array<{
      productId: string | null;
      variantId: string | null;
      isVariant: boolean;
      productName: string;
      brand: string;
      sku: string;
      flavor: string | null;
      size: string | null;
      servings: number | null;
      price: number;
      quantity: number;
      image: string | null;
    }>
  ) => {
    if (!window.Razorpay) {
      throw new Error(
        "Razorpay Checkout could not be loaded. Please refresh the page and try again."
      );
    }

    const {
      data: sessionData,
      error: sessionError,
    } =
      await supabase.auth.getSession();

    if (
      sessionError ||
      !sessionData.session
    ) {
      throw new Error(
        "Your session has expired. Please login again."
      );
    }

    const razorpayOptions: RazorpayOptions = {
      key:
        createOrder.key_id,

      amount:
        createOrder.amount,

      currency:
        createOrder.currency,

      name:
        "Seven Bucks Nutrition",

      description:
        "Online payment for your Seven Bucks Nutrition order",

      order_id:
        createOrder.razorpay_order_id,

      prefill: {
        name:
          shippingAddress.fullName,

        email:
          shippingAddress.email,

        contact:
          shippingAddress.phone,
      },

      notes: {
        checkout_type:
          "online_payment",
      },

      theme: {
        color: "#18222c",
      },

      modal: {
        ondismiss: () => {
          setIsSubmitting(false);

          toast.info(
            "Payment window closed. Your order has not been confirmed."
          );
        },
      },

      handler: async (
        response
      ) => {
        try {
          /*
           * Keep button locked while the server verifies
           * the Razorpay payment.
           */

          setIsSubmitting(true);

          const {
            data: latestSessionData,
            error:
              latestSessionError,
          } =
            await supabase.auth.getSession();

          if (
            latestSessionError ||
            !latestSessionData.session
          ) {
            throw new Error(
              "Your session has expired. Please login again."
            );
          }

          const accessToken =
            latestSessionData.session
              .access_token;

          /*
           * ---------------------------------------------------
           * VERIFY PAYMENT
           * ---------------------------------------------------
           *
           * Important:
           *
           * There is NO internal Supabase order ID yet.
           *
           * The server receives:
           * - Razorpay payment details
           * - Cart item references
           * - Shipping address
           *
           * After successful payment verification,
           * the server creates the actual Supabase order.
           */

          const verifyResponse =
            await fetch(
              "/api/razorpay/verify-payment",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",

                  Authorization:
                    `Bearer ${accessToken}`,
                },

                body: JSON.stringify({
                  razorpayOrderId:
                    response.razorpay_order_id,

                  razorpayPaymentId:
                    response.razorpay_payment_id,

                  razorpaySignature:
                    response.razorpay_signature,

                  items:
                    checkoutItems,

                  shippingAddress,
                }),
              }
            );

          const verifyResult =
            (await verifyResponse.json()) as VerifyPaymentResponse;

          if (
            !verifyResponse.ok ||
            !verifyResult.success
          ) {
            /*
             * Very important:
             *
             * If Razorpay captured the payment but
             * database finalization failed, don't tell
             * the customer that payment failed.
             */

            if (
              verifyResult.payment_received ||
              verifyResult.message?.toLowerCase().includes(
                "payment was received"
              )
            ) {
              toast.error(
                "Payment received. Your order confirmation is being processed. Please do not pay again."
              );

              setIsSubmitting(false);

              return;
            }

            throw new Error(
              verifyResult.message ||
                "Payment verification failed."
            );
          }

          /*
           * Payment + database confirmation successful.
           */

          if (!verifyResult.order_id) {
            throw new Error(
              "Payment succeeded but order confirmation number was not returned. Please contact support before making another payment."
            );
          }

          clearCart();

          toast.success(
            "Payment successful. Your order is confirmed."
          );

          /*
           * Move to the existing success page.
           */

          router.replace(
            `/order-success?order=${encodeURIComponent(
              verifyResult.order_id
            )}`
          );
        } catch (error) {
          console.error(
            "Payment verification failed:",
            error
          );

          const message =
            error instanceof Error
              ? error.message
              : "";

          toast.error(
            message ||
              "Payment verification failed. Please contact support before trying again."
          );

          setIsSubmitting(false);
        }
      },
    };

    const razorpay =
      new window.Razorpay(
        razorpayOptions
      );

    razorpay.open();
  };

  /*
   * -------------------------------------------------------
   * SUBMIT CHECKOUT
   * -------------------------------------------------------
   */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (authLoading) {
      toast.error(
        "Please wait while your account is loading."
      );

      return;
    }

    if (!user) {
      toast.error(
        "Please login first to proceed to checkout."
      );

      router.replace("/login");

      return;
    }

    if (items.length === 0) {
      toast.error(
        "Your bag is empty."
      );

      router.replace("/shop");

      return;
    }

    if (
      form.pincode.length !== 6
    ) {
      toast.error(
        "Please enter a valid 6-digit pincode."
      );

      return;
    }

    if (
      form.phone.length !== 10
    ) {
      toast.error(
        "Please enter a valid 10-digit phone number."
      );

      return;
    }

    if (
      !form.fullName.trim() ||
      !form.email.trim() ||
      !form.address.trim() ||
      !form.city.trim() ||
      !form.state.trim()
    ) {
      toast.error(
        "Please complete all required delivery details."
      );

      return;
    }

    if (isSubmitting) return;

    if (!window.Razorpay) {
      setRazorpayReady(false);

      toast.error(
        "Razorpay is still loading. Please wait a moment and try again."
      );

      return;
    }

    setRazorpayReady(true);
    setIsSubmitting(true);

    try {
      /*
       * -----------------------------------------------------
       * GET FRESH AUTH SESSION
       * -----------------------------------------------------
       */

      const {
        data: sessionData,
        error: sessionError,
      } =
        await supabase.auth.getSession();

      if (
        sessionError ||
        !sessionData.session
      ) {
        throw new Error(
          "Your session has expired. Please login again."
        );
      }

      const accessToken =
        sessionData.session.access_token;

      /*
       * -----------------------------------------------------
       * SHIPPING ADDRESS
       * -----------------------------------------------------
       */

      const shippingAddress: FormData = {
        fullName:
          form.fullName.trim(),

        email:
          form.email.trim(),

        phone:
          form.phone.trim(),

        address:
          form.address.trim(),

        landmark:
          form.landmark.trim(),

        city:
          form.city.trim(),

        state:
          form.state.trim(),

        pincode:
          form.pincode.trim(),
      };

      /*
       * -----------------------------------------------------
       * SEND CART TO SERVER
       * -----------------------------------------------------
       *
       * The server does NOT trust the prices from this client.
       *
       * It loads current product/variant prices from Supabase
       * and calculates the final amount itself.
       */

      const checkoutItems =
        items.map((item) => {
          const isVariant =
            item.isVariant !== false;

          return {
            /*
             * For variable products, productId is not required
             * by the create-order endpoint.
             *
             * For simple products, the existing cart structure
             * uses variantId as the product reference.
             */
            productId:
              isVariant
                ? null
                : item.variantId,

            variantId:
              isVariant
                ? item.variantId
                : null,

            isVariant,

            productName:
              item.productName,

            brand:
              item.brand,

            sku:
              item.sku,

            flavor:
              item.flavor ?? null,

            size:
              item.size ?? null,

            servings:
              item.servings ?? null,

            /*
             * Sent only as a client-side reference.
             *
             * Server ignores this for pricing.
             */

            price:
              Number(item.price),

            quantity:
              Number(item.quantity),

            image:
              item.image ?? null,
          };
        });

      /*
       * -----------------------------------------------------
       * CREATE SERVER-SIDE RAZORPAY ORDER
       * -----------------------------------------------------
       *
       * IMPORTANT:
       *
       * This does NOT create a Supabase orders row.
       *
       * It only creates the temporary Razorpay payment order.
       */

      const createResponse =
        await fetch(
          "/api/razorpay/create-order",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${accessToken}`,
            },

            body: JSON.stringify({
              items:
                checkoutItems,

              shippingAddress,
            }),
          }
        );

      const createResult =
        (await createResponse.json()) as
          | CreateOrderResponse
          | {
              success: false;
              message?: string;
            };

      if (
        !createResponse.ok ||
        !createResult.success
      ) {
        throw new Error(
          "message" in createResult &&
            createResult.message
            ? createResult.message
            : "Unable to initialize online payment."
        );
      }

      /*
       * -----------------------------------------------------
       * OPEN RAZORPAY
       * -----------------------------------------------------
       */

      await openRazorpayCheckout(
        createResult,
        shippingAddress,
        checkoutItems
      );
    } catch (error) {
      console.error(
        "Checkout payment initialization failed:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "";

      if (
        message.includes(
          "session has expired"
        ) ||
        message.includes(
          "Authentication required"
        )
      ) {
        toast.error(
          "Your session has expired. Please login again."
        );

        router.replace("/login");
      } else if (
        message.toLowerCase().includes(
          "insufficient stock"
        ) ||
        message.toLowerCase().includes(
          "out of stock"
        )
      ) {
        toast.error(
          "Some item is out of stock. Please update your bag."
        );
      } else if (
        message.includes(
          "variant"
        )
      ) {
        toast.error(
          message
        );
      } else if (
        message.includes(
          "product"
        )
      ) {
        toast.error(
          message
        );
      } else {
        toast.error(
          message ||
            "Unable to start online payment. Please try again."
        );
      }

      setIsSubmitting(false);
    }
  };

  /*
   * -------------------------------------------------------
   * AUTH LOADING / LOGIN REDIRECT
   * -------------------------------------------------------
   */

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

  /*
   * -------------------------------------------------------
   * EMPTY BAG
   * -------------------------------------------------------
   */

  if (items.length === 0) {
    return (
      <>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
          onLoad={handleRazorpayLoad}
        />

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
      </>
    );
  }

  /*
   * -------------------------------------------------------
   * CHECKOUT
   * -------------------------------------------------------
   */

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={handleRazorpayLoad}
        onError={() =>
          setRazorpayReady(false)
        }
      />

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
                            .replace(
                              /\D/g,
                              ""
                            )
                            .slice(
                              0,
                              10
                            )
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
                            .replace(
                              /\D/g,
                              ""
                            )
                            .slice(
                              0,
                              6
                            )
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
                        Razorpay Online Payment
                      </p>

                      <p className="mt-1 text-xs leading-5 text-ivory/55">
                        Pay securely using UPI, cards, net
                        banking and other supported Razorpay
                        payment methods.
                      </p>
                    </div>
                  </div>
                </div>

                {!razorpayReady && (
                  <p className="mt-3 text-[10px] leading-5 text-espresso/40">
                    Secure payment gateway is loading...
                  </p>
                )}
              </section>
            </div>

            <aside className="h-fit rounded-2xl border border-border bg-card p-5 sm:p-6 lg:sticky lg:top-28">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-clay">
                Order Summary
              </p>

              <div className="mt-6 space-y-4">
                {items.map((item) => (
                  <div
                    key={item.variantId ?? item.sku}
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
                        {item.size ??
                          "Standard"}
                        {item.flavor
                          ? ` · ${item.flavor}`
                          : ""}
                      </p>

                      <p className="mt-1 text-[10px] text-espresso/45">
                        Qty{" "}
                        {item.quantity}
                      </p>
                    </div>

                    <p className="shrink-0 text-xs font-semibold">
                      {formatPrice(
                        item.price *
                          item.quantity
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
                    {formatPrice(
                      subtotal
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-espresso/50">
                    Shipping
                  </span>

                  <span className="font-semibold">
                    {shipping === 0
                      ? "FREE"
                      : formatPrice(
                          shipping
                        )}
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
                    {formatPrice(
                      total
                    )}
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
                  !user ||
                  !razorpayReady
                }
                className="mt-7 flex h-14 w-full items-center justify-center rounded-xl bg-espresso px-5 text-[10px] font-bold uppercase tracking-[0.2em] text-ivory transition hover:bg-espresso/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting
                  ? "Processing Payment..."
                  : `Pay ${formatPrice(
                      total
                    )}`}
              </button>

              <Link
                href="/cart"
                className="mt-4 flex h-12 w-full items-center justify-center rounded-xl border border-border text-[9px] font-bold uppercase tracking-[0.18em] text-espresso/65 transition hover:border-espresso/30 hover:text-espresso"
              >
                Back to Bag
              </Link>

              <p className="mt-6 text-center text-[9px] leading-5 text-espresso/35">
                Secure Razorpay checkout ·
                Trusted nutrition · Faridabad
              </p>
            </aside>
          </form>
        </section>
      </main>
    </>
  );
}