import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Razorpay from "razorpay";

export const runtime = "nodejs";

type CheckoutItem = {
  productId?: string | null;
  variantId?: string | null;
  quantity: number;
  isVariant: boolean;
};

type ShippingAddress = {
  fullName: string;
  phone: string;
  email: string;
  address?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
};

function getBearerToken(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  return authorization.slice(7).trim();
}

function generateRazorpayReceipt() {
  const timestamp = Date.now().toString().slice(-10);
  const random = Math.floor(1000 + Math.random() * 9000);

  return `SBN-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const razorpayKeyId =
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    const razorpayKeySecret =
      process.env.RAZORPAY_KEY_SECRET;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Supabase environment variables are missing.",
        },
        { status: 500 },
      );
    }

    if (!razorpayKeyId || !razorpayKeySecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Razorpay environment variables are missing.",
        },
        { status: 500 },
      );
    }

    /*
     * -------------------------------------------------------
     * AUTHENTICATION
     * -------------------------------------------------------
     */

    const accessToken = getBearerToken(request);

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 },
      );
    }

    const supabase = createClient(
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
            Authorization: `Bearer ${accessToken}`,
          },
        },
      },
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
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
     * REQUEST BODY
     * -------------------------------------------------------
     */

    const body = await request.json();

    const items = body?.items as CheckoutItem[] | undefined;

    const shippingAddress =
      body?.shippingAddress as ShippingAddress | undefined;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Your cart is empty.",
        },
        { status: 400 },
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        {
          success: false,
          message: "Shipping address is required.",
        },
        { status: 400 },
      );
    }

    /*
     * -------------------------------------------------------
     * NORMALIZE CART
     * -------------------------------------------------------
     */

    const normalizedItems = new Map<
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
            message: "Invalid cart item.",
          },
          { status: 400 },
        );
      }

      /*
       * Variant products require variantId.
       */

      if (item.isVariant) {
        if (!item.variantId) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid product variant.",
            },
            { status: 400 },
          );
        }
      } else {
        /*
         * Simple products require productId.
         */

        if (!item.productId) {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid product.",
            },
            { status: 400 },
          );
        }
      }

      const key = item.isVariant
        ? `variant:${item.variantId}`
        : `product:${item.productId}`;

      const existing = normalizedItems.get(key);

      if (existing) {
        existing.quantity += item.quantity;
      } else {
        normalizedItems.set(key, {
          productId: item.productId ?? null,
          variantId: item.variantId ?? null,
          quantity: item.quantity,
          isVariant: item.isVariant,
        });
      }
    }

    const finalItems = Array.from(
      normalizedItems.values(),
    );

    /*
     * -------------------------------------------------------
     * SERVER-SIDE PRICE + STOCK VALIDATION
     * -------------------------------------------------------
     *
     * IMPORTANT:
     *
     * No Supabase order is created here.
     *
     * No order_items are created here.
     *
     * No stock is decreased here.
     *
     * This endpoint only validates the current cart and
     * creates the temporary Razorpay order.
     *
     * Final stock validation + stock decrement happens only
     * after successful payment inside the paid-order RPC.
     * -------------------------------------------------------
     */

    let subtotal = 0;

    for (const item of finalItems) {
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
              message: "Invalid product variant.",
            },
            { status: 400 },
          );
        }

        /*
         * IMPORTANT:
         *
         * product_variants DOES NOT contain stock_quantity.
         *
         * Variant stock is stored in:
         *
         * inventory.variant_id
         * inventory.stock_quantity
         */

        const {
          data: variant,
          error: variantError,
        } = await supabase
          .from("product_variants")
          .select(
            `
              id,
              product_id,
              price,
              is_available,
              sku,
              flavor,
              size,
              servings,
              image_url,
              products (
                id,
                name,
                is_active,
                is_available
              )
            `,
          )
          .eq("id", item.variantId)
          .maybeSingle();

        if (variantError) {
          console.error(
            "Variable product lookup failed:",
            variantError,
          );

          return NextResponse.json(
            {
              success: false,
              message:
                "Unable to verify one of the products.",
            },
            { status: 500 },
          );
        }

        if (!variant) {
          return NextResponse.json(
            {
              success: false,
              message:
                "This product variant is no longer available.",
            },
            { status: 409 },
          );
        }

        const product = Array.isArray(variant.products)
          ? variant.products[0]
          : variant.products;

        if (!product) {
          return NextResponse.json(
            {
              success: false,
              message:
                "This product is no longer available.",
            },
            { status: 409 },
          );
        }

        /*
         * IMPORTANT:
         *
         * For VARIABLE PRODUCTS the parent product's
         * is_available flag does NOT control checkout.
         *
         * The parent only needs to be active.
         *
         * Actual availability is controlled by:
         *
         * 1. variant.is_available
         * 2. inventory.stock_quantity
         */

        if (!product.is_active) {
          return NextResponse.json(
            {
              success: false,
              message:
                `${product.name} is currently unavailable.`,
            },
            { status: 409 },
          );
        }

        /*
         * ---------------------------------------------------
         * VARIANT AVAILABILITY
         * ---------------------------------------------------
         */

        if (!variant.is_available) {
          return NextResponse.json(
            {
              success: false,
              message:
                `${product.name} variant is currently unavailable.`,
            },
            { status: 409 },
          );
        }

        /*
         * ---------------------------------------------------
         * GET EXACT VARIANT STOCK FROM INVENTORY
         * ---------------------------------------------------
         */

        const {
          data: inventory,
          error: inventoryError,
        } = await supabase
          .from("inventory")
          .select(
            `
              variant_id,
              stock_quantity
            `,
          )
          .eq("variant_id", item.variantId)
          .maybeSingle();

        if (inventoryError) {
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

        const stockQuantity = Number(
          inventory.stock_quantity ?? 0,
        );

        if (stockQuantity < item.quantity) {
          return NextResponse.json(
            {
              success: false,
              message:
                `${product.name} has only ${stockQuantity} unit(s) available.`,
            },
            { status: 409 },
          );
        }

        /*
         * ---------------------------------------------------
         * SERVER-SIDE VARIANT PRICE
         * ---------------------------------------------------
         */

        const unitPrice = Number(
          variant.price ?? 0,
        );

        if (
          !Number.isFinite(unitPrice) ||
          unitPrice < 0
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                `Invalid price for ${product.name}.`,
            },
            { status: 500 },
          );
        }

        subtotal +=
          unitPrice * item.quantity;
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
              message: "Invalid product.",
            },
            { status: 400 },
          );
        }

        const {
          data: product,
          error: productError,
        } = await supabase
          .from("products")
          .select(
            `
              id,
              name,
              price,
              stock_quantity,
              is_active,
              is_available
            `,
          )
          .eq("id", item.productId)
          .maybeSingle();

        if (productError) {
          console.error(
            "Simple product lookup failed:",
            productError,
          );

          return NextResponse.json(
            {
              success: false,
              message:
                "Unable to verify one of the products.",
            },
            { status: 500 },
          );
        }

        if (!product) {
          return NextResponse.json(
            {
              success: false,
              message:
                "This product is no longer available.",
            },
            { status: 409 },
          );
        }

        /*
         * Simple products use the parent product's
         * availability flag.
         */

        if (
          !product.is_active ||
          !product.is_available
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                `${product.name} is currently unavailable.`,
            },
            { status: 409 },
          );
        }

        /*
         * ---------------------------------------------------
         * SIMPLE PRODUCT STOCK
         * ---------------------------------------------------
         */

        const stockQuantity = Number(
          product.stock_quantity ?? 0,
        );

        if (stockQuantity < item.quantity) {
          return NextResponse.json(
            {
              success: false,
              message:
                `${product.name} has only ${stockQuantity} unit(s) available.`,
            },
            { status: 409 },
          );
        }

        /*
         * ---------------------------------------------------
         * SERVER-SIDE SIMPLE PRODUCT PRICE
         * ---------------------------------------------------
         */

        const unitPrice = Number(
          product.price ?? 0,
        );

        if (
          !Number.isFinite(unitPrice) ||
          unitPrice < 0
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                `Invalid price for ${product.name}.`,
            },
            { status: 500 },
          );
        }

        subtotal +=
          unitPrice * item.quantity;
      }
    }

    /*
     * -------------------------------------------------------
     * SHIPPING
     * -------------------------------------------------------
     *
     * Current store rule:
     *
     * ₹999 or above -> FREE SHIPPING
     * Below ₹999   -> ₹99 shipping
     * -------------------------------------------------------
     */

    const shippingFee =
      subtotal >= 999 ? 0 : 99;

    const totalAmount =
      subtotal + shippingFee;

    if (
      !Number.isFinite(totalAmount) ||
      totalAmount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order amount.",
        },
        { status: 400 },
      );
    }

    /*
     * -------------------------------------------------------
     * RAZORPAY ORDER ONLY
     * -------------------------------------------------------
     *
     * IMPORTANT:
     *
     * NO public.orders INSERT HERE.
     * NO order_items INSERT HERE.
     * NO stock decrement HERE.
     *
     * The Razorpay order is temporary until payment
     * succeeds.
     * -------------------------------------------------------
     */

    const razorpay =
      new Razorpay({
        key_id: razorpayKeyId,
        key_secret: razorpayKeySecret,
      });

    const razorpayReceipt =
      generateRazorpayReceipt();

    const razorpayOrder =
      await razorpay.orders.create({
        amount: Math.round(
          totalAmount * 100,
        ),
        currency: "INR",
        receipt: razorpayReceipt,
        notes: {
          customer_id: user.id,
          checkout_type: "online_payment",
        },
      });

    if (!razorpayOrder?.id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to create Razorpay order.",
        },
        { status: 500 },
      );
    }

    /*
     * -------------------------------------------------------
     * RETURN RAZORPAY DATA
     * -------------------------------------------------------
     */

    return NextResponse.json({
      success: true,

      key_id:
        razorpayKeyId,

      razorpay_order_id:
        razorpayOrder.id,

      /*
       * No internal Supabase order exists yet.
       */

      order_id: "",

      order_number: "",

      amount:
        Math.round(
          totalAmount * 100,
        ),

      currency: "INR",

      subtotal,

      shipping_fee: shippingFee,

      total_amount: totalAmount,
    });
  } catch (error) {
    console.error(
      "Razorpay create-order error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to create payment order.",
      },
      { status: 500 },
    );
  }
}