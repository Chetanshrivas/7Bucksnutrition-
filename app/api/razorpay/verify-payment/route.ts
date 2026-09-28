import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Razorpay from "razorpay";
import crypto from "crypto";

export const runtime = "nodejs";

type CheckoutItem = {
  productId?: string | null;
  variantId?: string | null;
  quantity: number;
  isVariant: boolean;
};

type ShippingAddress = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
};

type VerifyPaymentRequest = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  items: CheckoutItem[];
  shippingAddress: ShippingAddress;
};

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");

  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(" ");

  if (
    scheme?.toLowerCase() !== "bearer" ||
    !token
  ) {
    return null;
  }

  return token;
}

function safeEqualHex(
  received: string,
  expected: string,
) {
  const receivedBuffer = Buffer.from(
    received,
    "utf8",
  );

  const expectedBuffer = Buffer.from(
    expected,
    "utf8",
  );

  if (
    receivedBuffer.length !==
    expectedBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    receivedBuffer,
    expectedBuffer,
  );
}

export async function POST(request: Request) {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const razorpayKeyId =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    const razorpayKeySecret =
      process.env.RAZORPAY_KEY_SECRET;

    if (
      !supabaseUrl ||
      !supabaseAnonKey
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Supabase is not configured.",
        },
        { status: 500 },
      );
    }

    if (
      !razorpayKeyId ||
      !razorpayKeySecret
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Razorpay is not configured.",
        },
        { status: 500 },
      );
    }

    /*
     * -------------------------------------------------------
     * 1. AUTHENTICATE CUSTOMER
     * -------------------------------------------------------
     */

    const accessToken =
      getBearerToken(request);

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Authentication required.",
        },
        { status: 401 },
      );
    }

    const supabase =
      createClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },

          global: {
            headers: {
              Authorization:
                `Bearer ${accessToken}`,
            },
          },
        },
      );

    const {
      data: {
        user,
      },
      error: userError,
    } =
      await supabase.auth.getUser(
        accessToken,
      );

    if (
      userError ||
      !user
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your session has expired. Please login again.",
        },
        { status: 401 },
      );
    }

    /*
     * -------------------------------------------------------
     * 2. READ REQUEST
     * -------------------------------------------------------
     */

    const body =
      (await request.json()) as VerifyPaymentRequest;

    const razorpayOrderId =
      body.razorpayOrderId?.trim();

    const razorpayPaymentId =
      body.razorpayPaymentId?.trim();

    const razorpaySignature =
      body.razorpaySignature?.trim();

    const items =
      body.items;

    const shippingAddress =
      body.shippingAddress;

    if (
      !razorpayOrderId ||
      !razorpayPaymentId ||
      !razorpaySignature
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Incomplete payment information.",
        },
        { status: 400 },
      );
    }

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cart information is missing.",
        },
        { status: 400 },
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Shipping information is missing.",
        },
        { status: 400 },
      );
    }

    /*
     * -------------------------------------------------------
     * 3. NORMALIZE CART
     * -------------------------------------------------------
     */

    const normalizedItems =
      new Map<
        string,
        {
          productId: string | null;
          variantId: string | null;
          quantity: number;
          isVariant: boolean;
        }
      >();

    for (const item of items) {
      if (
        !item ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid cart item.",
          },
          { status: 400 },
        );
      }

      if (item.isVariant) {
        if (!item.variantId) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Invalid product variant.",
            },
            { status: 400 },
          );
        }
      } else {
        if (!item.productId) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Invalid product.",
            },
            { status: 400 },
          );
        }
      }

      const key = item.isVariant
        ? `variant:${item.variantId}`
        : `product:${item.productId}`;

      const existing =
        normalizedItems.get(key);

      if (existing) {
        existing.quantity +=
          item.quantity;
      } else {
        normalizedItems.set(
          key,
          {
            productId:
              item.productId ?? null,

            variantId:
              item.variantId ?? null,

            quantity:
              item.quantity,

            isVariant:
              item.isVariant,
          },
        );
      }
    }

    const finalItems =
      Array.from(
        normalizedItems.values(),
      );

    /*
     * -------------------------------------------------------
     * 4. RAZORPAY CLIENT
     * -------------------------------------------------------
     */

    const razorpay =
      new Razorpay({
        key_id:
          razorpayKeyId,

        key_secret:
          razorpayKeySecret,
      });

    /*
     * -------------------------------------------------------
     * 5. VERIFY RAZORPAY SIGNATURE
     * -------------------------------------------------------
     */

    const signaturePayload =
      `${razorpayOrderId}|${razorpayPaymentId}`;

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          razorpayKeySecret,
        )
        .update(signaturePayload)
        .digest("hex");

    if (
      !safeEqualHex(
        razorpaySignature,
        expectedSignature,
      )
    ) {
      console.error(
        "Invalid Razorpay signature.",
        {
          razorpayOrderId,
          razorpayPaymentId,
        },
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment verification failed.",
        },
        { status: 400 },
      );
    }

    /*
     * -------------------------------------------------------
     * 6. FETCH PAYMENT FROM RAZORPAY
     * -------------------------------------------------------
     */

    const payment =
      await razorpay.payments.fetch(
        razorpayPaymentId,
      );

    if (
      payment.order_id !==
      razorpayOrderId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment order mismatch.",
        },
        { status: 400 },
      );
    }

    /*
     * -------------------------------------------------------
     * 7. HANDLE PAYMENT STATUS
     * -------------------------------------------------------
     */

    let paymentStatus =
      payment.status;

    if (
      paymentStatus ===
      "authorized"
    ) {
      try {
        const capturedPayment =
          await razorpay.payments.capture(
            razorpayPaymentId,
            Number(payment.amount),
            "INR",
          );

        paymentStatus =
          capturedPayment.status;
      } catch (captureError) {
        console.error(
          "Razorpay capture failed:",
          captureError,
        );

        const refreshedPayment =
          await razorpay.payments.fetch(
            razorpayPaymentId,
          );

        paymentStatus =
          refreshedPayment.status;
      }
    }

    /*
     * -------------------------------------------------------
     * PAYMENT NOT CAPTURED
     * -------------------------------------------------------
     *
     * No Supabase order.
     * No order_items.
     * No stock decrement.
     */

    if (
      paymentStatus !==
      "captured"
    ) {
      return NextResponse.json(
        {
          success: false,

          payment_status:
            paymentStatus,

          message:
            paymentStatus ===
            "failed"
              ? "Payment failed. No order was created."
              : "Payment has not been captured.",
        },
        {
          status:
            paymentStatus ===
            "failed"
              ? 402
              : 409,
        },
      );
    }

    /*
     * -------------------------------------------------------
     * 8. FETCH RAZORPAY ORDER
     * -------------------------------------------------------
     */

    const razorpayOrder =
      await razorpay.orders.fetch(
        razorpayOrderId,
      );

    const razorpayAmount =
      Number(
        razorpayOrder.amount,
      );

    if (
      !Number.isFinite(
        razorpayAmount,
      ) ||
      razorpayAmount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid Razorpay order amount.",
        },
        { status: 400 },
      );
    }

    /*
     * -------------------------------------------------------
     * 9. RE-CALCULATE CART FROM DATABASE
     * -------------------------------------------------------
     *
     * Browser price is NEVER trusted.
     * -------------------------------------------------------
     */

    let subtotal = 0;

    /*
     * IMPORTANT:
     *
     * The SQL RPC expects:
     *
     * p_items -> price
     *
     * NOT:
     *
     * p_items -> unitPrice
     *
     * Therefore this object deliberately uses `price`.
     */

    const serverItems: Array<{
      productId: string;
      variantId: string | null;
      productName: string;
      brandName: string;
      sku: string;
      flavor: string | null;
      size: string | null;
      servings: number | null;
      price: number;
      quantity: number;
      productImageUrl: string | null;
    }> = [];

    for (
      const item of finalItems
    ) {
      /*
       * -----------------------------------------------------
       * VARIABLE PRODUCT
       * -----------------------------------------------------
       */

      if (item.isVariant) {
        if (!item.variantId) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Invalid product variant.",
            },
            { status: 400 },
          );
        }

        const {
          data: variant,
          error,
        } =
          await supabase
            .from(
              "product_variants",
            )
            .select(
              `
                id,
                product_id,
                flavor,
                size,
                servings,
                price,
                sku,
                image_url,
                is_available,
                products (
                  id,
                  name,
                  is_active,
                  is_available,
                  brands (
                    id,
                    name
                  )
                )
              `,
            )
            .eq(
              "id",
              item.variantId,
            )
            .maybeSingle();

        if (
          error ||
          !variant
        ) {
          console.error(
            "Variant lookup failed:",
            error,
          );

          return NextResponse.json(
            {
              success: false,
              message:
                "A product in your cart is no longer available.",
            },
            { status: 409 },
          );
        }

        const product =
          Array.isArray(
            variant.products,
          )
            ? variant.products[0]
            : variant.products;

        if (
          !product ||
          !product.is_active ||
          !variant.is_available
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                `${product?.name ?? "A product"} is no longer available.`,
            },
            { status: 409 },
          );
        }

        /*
         * ---------------------------------------------------
         * VARIANT STOCK FROM INVENTORY
         * ---------------------------------------------------
         *
         * product_variants has NO stock_quantity.
         *
         * Actual schema:
         *
         * inventory.variant_id
         * inventory.stock_quantity
         * ---------------------------------------------------
         */

        const {
          data: inventory,
          error:
            inventoryError,
        } =
          await supabase
            .from("inventory")
            .select(
              `
                variant_id,
                stock_quantity
              `,
            )
            .eq(
              "variant_id",
              variant.id,
            )
            .maybeSingle();

        if (
          inventoryError
        ) {
          console.error(
            "Variant inventory lookup failed:",
            inventoryError,
          );

          return NextResponse.json(
            {
              success: false,
              message:
                "Unable to verify product stock.",
            },
            { status: 500 },
          );
        }

        if (!inventory) {
          return NextResponse.json(
            {
              success: false,
              message:
                `${product.name} variant is currently out of stock.`,
            },
            { status: 409 },
          );
        }

        const stockQuantity =
          Number(
            inventory.stock_quantity ??
              0,
          );

        if (
          stockQuantity <
          item.quantity
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                `${product.name} has only ${stockQuantity} unit(s) available.`,
            },
            { status: 409 },
          );
        }

        const unitPrice =
          Number(
            variant.price,
          );

        if (
          !Number.isFinite(
            unitPrice,
          ) ||
          unitPrice < 0
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Invalid product price.",
            },
            { status: 500 },
          );
        }

        subtotal +=
          unitPrice *
          item.quantity;

        const brand =
          Array.isArray(
            product.brands,
          )
            ? product.brands[0]
            : product.brands;

        serverItems.push({
          productId:
            product.id,

          variantId:
            variant.id,

          productName:
            product.name,

          brandName:
            brand?.name ?? "",

          sku:
            variant.sku ?? "",

          flavor:
            variant.flavor ?? null,

          size:
            variant.size ?? null,

          servings:
            variant.servings ??
            null,

          /*
           * IMPORTANT:
           * RPC expects `price`.
           */
          price:
            unitPrice,

          quantity:
            item.quantity,

          productImageUrl:
            variant.image_url ??
            null,
        });
      } else {
        /*
         * -----------------------------------------------------
         * SIMPLE PRODUCT
         * -----------------------------------------------------
         */

        if (!item.productId) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Invalid product.",
            },
            { status: 400 },
          );
        }

        const {
          data: product,
          error,
        } =
          await supabase
            .from("products")
            .select(
              `
                id,
                name,
                brand_id,
                sku,
                price,
                stock_quantity,
                is_active,
                is_available,
                brands (
                  id,
                  name
                )
              `,
            )
            .eq(
              "id",
              item.productId,
            )
            .maybeSingle();

        if (
          error ||
          !product
        ) {
          console.error(
            "Simple product lookup failed:",
            error,
          );

          return NextResponse.json(
            {
              success: false,
              message:
                "A product in your cart is no longer available.",
            },
            { status: 409 },
          );
        }

        if (
          !product.is_active ||
          !product.is_available
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                `${product.name} is no longer available.`,
            },
            { status: 409 },
          );
        }

        /*
         * ---------------------------------------------------
         * SIMPLE PRODUCT STOCK
         * ---------------------------------------------------
         */

        const stockQuantity =
          Number(
            product.stock_quantity ??
              0,
          );

        if (
          stockQuantity <
          item.quantity
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                `${product.name} has only ${stockQuantity} unit(s) available.`,
            },
            { status: 409 },
          );
        }

        const unitPrice =
          Number(
            product.price,
          );

        if (
          !Number.isFinite(
            unitPrice,
          ) ||
          unitPrice < 0
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Invalid product price.",
            },
            { status: 500 },
          );
        }

        subtotal +=
          unitPrice *
          item.quantity;

        const brand =
          Array.isArray(
            product.brands,
          )
            ? product.brands[0]
            : product.brands;

        serverItems.push({
          productId:
            product.id,

          variantId:
            null,

          productName:
            product.name,

          brandName:
            brand?.name ?? "",

          sku:
            product.sku ?? "",

          flavor:
            null,

          size:
            null,

          servings:
            null,

          /*
           * IMPORTANT:
           * RPC expects `price`.
           */
          price:
            unitPrice,

          quantity:
            item.quantity,

          productImageUrl:
            null,
        });
      }
    }

    /*
     * -------------------------------------------------------
     * 10. SERVER TOTAL
     * -------------------------------------------------------
     */

    const shippingFee =
      subtotal >= 999
        ? 0
        : 99;

    const totalAmount =
      subtotal +
      shippingFee;

    const expectedRazorpayAmount =
      Math.round(
        totalAmount * 100,
      );

    /*
     * Verify Razorpay order amount.
     */

    if (
      razorpayAmount !==
      expectedRazorpayAmount
    ) {
      console.error(
        "Razorpay amount mismatch.",
        {
          razorpayAmount,
          expectedRazorpayAmount,
          razorpayOrderId,
        },
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "Payment amount does not match your cart.",
        },
        { status: 400 },
      );
    }

    /*
     * Verify actual payment amount.
     */

    if (
      Number(payment.amount) !==
      expectedRazorpayAmount
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Payment amount verification failed.",
        },
        { status: 400 },
      );
    }

    /*
     * -------------------------------------------------------
     * 11. FINALIZE ORDER ATOMICALLY
     * -------------------------------------------------------
     *
     * The RPC handles:
     *
     * - duplicate payment protection
     * - stock locking
     * - stock validation
     * - order creation
     * - order_items creation
     * - stock decrement
     * - payment = paid
     * - order = confirmed
     *
     * If anything fails, PostgreSQL rolls everything back.
     * -------------------------------------------------------
     */

    const {
      data: finalizedOrder,
      error:
        finalizeError,
    } =
      await supabase.rpc(
        "create_razorpay_paid_order",
        {
          p_customer_id:
            user.id,

          p_customer_name:
            shippingAddress.fullName,

          p_customer_email:
            shippingAddress.email,

          p_customer_phone:
            shippingAddress.phone,

          p_shipping_address:
            shippingAddress,

          p_subtotal:
            subtotal,

          p_shipping_fee:
            shippingFee,

          p_discount_amount:
            0,

          p_total_amount:
            totalAmount,

          p_currency:
            "INR",

          /*
           * IMPORTANT:
           *
           * serverItems contains `price`,
           * exactly matching the SQL RPC.
           */
          p_items:
            serverItems,

          p_razorpay_order_id:
            razorpayOrderId,

          p_razorpay_payment_id:
            razorpayPaymentId,

          p_razorpay_signature:
            razorpaySignature,

          p_payment_captured_at:
            new Date().toISOString(),
        },
      );

    if (
      finalizeError
    ) {
      console.error(
        "Paid order finalization failed:",
        finalizeError,
      );

      /*
       * Payment has already been captured.
       *
       * NEVER ask customer to pay again.
       */

      return NextResponse.json(
        {
          success: false,

          payment_received:
            true,

          message:
            "Payment was received, but order confirmation could not be completed. Please do not make another payment.",
        },
        { status: 500 },
      );
    }

    /*
     * -------------------------------------------------------
     * 12. SUCCESS
     * -------------------------------------------------------
     */

    const result =
      Array.isArray(
        finalizedOrder,
      )
        ? finalizedOrder[0]
        : finalizedOrder;

    return NextResponse.json({
      success: true,

      already_processed:
        result?.already_processed ??
        false,

      order_id:
        result?.order_id ??
        null,

      order_number:
        result?.order_number ??
        null,

      payment_status:
        "paid",

      order_status:
        "confirmed",

      razorpay_order_id:
        razorpayOrderId,

      razorpay_payment_id:
        razorpayPaymentId,

      payment_captured_at:
        new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "Razorpay verification error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to verify your payment right now.",
      },
      { status: 500 },
    );
  }
}