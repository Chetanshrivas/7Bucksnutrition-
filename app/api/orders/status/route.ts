import { NextRequest, NextResponse } from "next/server";

import { supabase } from "../../../../lib/supabase";
import { sendOrderStatusEmail } from "../../../../lib/email";

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

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 },
      );
    }

    const accessToken = authorization.slice("Bearer ".length).trim();

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 },
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 401 },
      );
    }

    const { data: admin, error: adminError } = await supabase
      .from("customers")
      .select("role, is_active")
      .eq("id", user.id)
      .maybeSingle();

    if (
      adminError ||
      !admin ||
      admin.role !== "admin" ||
      admin.is_active !== true
    ) {
      return NextResponse.json(
        { success: false, error: "Admin access required." },
        { status: 403 },
      );
    }

    const body = await request.json();

    const orderId =
      typeof body?.orderId === "string"
        ? body.orderId.trim()
        : "";

    const newStatus =
      typeof body?.newStatus === "string"
        ? body.newStatus.trim()
        : "";

    if (!orderId || !newStatus) {
      return NextResponse.json(
        {
          success: false,
          error: "orderId and newStatus are required.",
        },
        { status: 400 },
      );
    }

    if (!ORDER_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid order status.",
        },
        { status: 400 },
      );
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError) {
      console.error("Order status email fetch error:", orderError);

      return NextResponse.json(
        {
          success: false,
          error: "Unable to fetch the order.",
        },
        { status: 500 },
      );
    }

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found.",
        },
        { status: 404 },
      );
    }

    await sendOrderStatusEmail(order, newStatus);

    return NextResponse.json({
      success: true,
      email_sent: true,
    });
  } catch (error) {
    console.error("Order status email error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to send order status email.",
      },
      { status: 500 },
    );
  }
}
