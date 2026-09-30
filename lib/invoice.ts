import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type InvoiceItem = {
  product_name: string;
  brand_name?: string | null;
  sku?: string | null;
  flavor?: string | null;
  size?: string | null;
  servings?: number | null;
  unit_price: number;
  quantity: number;
  total_price: number;
};

export type InvoiceOrder = {
  order_number: string;
  created_at?: string | null;
  placed_at?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  shipping_address?: Record<string, unknown> | null;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total_amount: number;
  currency?: string | null;
  payment_method?: string | null;
  payment_status?: string | null;
  razorpay_payment_id?: string | null;
};

function money(value: number, currency = "INR") {
  const label = currency === "INR" ? "INR" : currency;

  return `${label} ${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function safeText(value: unknown) {
  return String(value ?? "")
    .replace(/\r?\n/g, " ")
    .trim();
}

function addressLines(
  address: Record<string, unknown> | null | undefined
) {
  if (!address) return [];

  const line1 =
    clean(address.address_line_1) ||
    clean(address.address);

  const line2 = clean(address.address_line_2);
  const landmark = clean(address.landmark);
  const city = clean(address.city);
  const state = clean(address.state);
  const postal =
    clean(address.postal_code) ||
    clean(address.pincode);
  const country =
    clean(address.country) ||
    "India";

  return [
    line1,
    line2,
    landmark ? `Landmark: ${landmark}` : "",
    [city, state, postal].filter(Boolean).join(", "),
    country,
  ].filter(Boolean);
}

export async function generateInvoicePdf(
  order: InvoiceOrder,
  items: InvoiceItem[]
): Promise<Buffer> {
  const pdf = await PDFDocument.create();

  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 46;
  const contentWidth = pageWidth - margin * 2;

  // Clean black / white invoice palette.
  const black = rgb(0.055, 0.055, 0.055);
  const dark = rgb(0.12, 0.12, 0.12);
  const muted = rgb(0.42, 0.42, 0.42);
  const lightMuted = rgb(0.62, 0.62, 0.62);
  const line = rgb(0.86, 0.86, 0.86);
  const soft = rgb(0.965, 0.965, 0.965);
  const white = rgb(1, 1, 1);

  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const newPage = () => {
    page = pdf.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  };

  const ensureSpace = (height: number) => {
    if (y - height < margin + 28) {
      newPage();
    }
  };

  const drawText = (
    text: string,
    x: number,
    size: number,
    font = regular,
    color = dark
  ) => {
    page.drawText(safeText(text), {
      x,
      y,
      size,
      font,
      color,
    });
  };

  const drawRight = (
    text: string,
    rightX: number,
    size: number,
    font = regular,
    color = dark
  ) => {
    const safe = safeText(text);
    const width = font.widthOfTextAtSize(safe, size);

    page.drawText(safe, {
      x: rightX - width,
      y,
      size,
      font,
      color,
    });
  };

  const drawLine = (
    color = line,
    thickness = 0.7
  ) => {
    page.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      thickness,
      color,
    });
  };

  const drawLabel = (text: string, x: number) => {
    page.drawText(text, {
      x,
      y,
      size: 7,
      font: bold,
      color: muted,
    });
  };

  const drawBox = (
    x: number,
    boxY: number,
    width: number,
    height: number
  ) => {
    page.drawRectangle({
      x,
      y: boxY,
      width,
      height,
      color: white,
      borderColor: line,
      borderWidth: 0.7,
    });
  };

  // =========================================================
  // HEADER — simple, corporate, black & white
  // =========================================================

  page.drawText("7BucksNutrition", {
    x: margin,
    y: pageHeight - margin - 2,
    size: 21,
    font: bold,
    color: black,
  });

  page.drawText(
    "SPORTS NUTRITION & SUPPLEMENTS",
    {
      x: margin + 1,
      y: pageHeight - margin - 17,
      size: 6.5,
      font: bold,
      color: lightMuted,
    }
  );

  drawRight(
    "INVOICE",
    pageWidth - margin,
    18,
    bold,
    black
  );

  drawRight(
    `#${order.order_number}`,
    pageWidth - margin,
    8,
    regular,
    muted
  );

  y = pageHeight - margin - 42;
  drawLine(black, 1.1);
  y -= 28;

  // =========================================================
  // CUSTOMER + ORDER INFORMATION
  // =========================================================

  const columnGap = 30;
  const columnWidth =
    (contentWidth - columnGap) / 2;

  const infoTop = y;
  const infoHeight = 102;
  const leftX = margin;
  const rightX = margin + columnWidth + columnGap;

  drawBox(
    leftX,
    infoTop - infoHeight,
    columnWidth,
    infoHeight
  );

  drawBox(
    rightX,
    infoTop - infoHeight,
    columnWidth,
    infoHeight
  );

  y = infoTop - 17;
  drawLabel("BILL TO", leftX + 14);
  y -= 17;

  drawText(
    order.customer_name || "Customer",
    leftX + 14,
    11,
    bold,
    black
  );

  y -= 17;

  drawText(
    order.customer_email || "—",
    leftX + 14,
    8,
    regular,
    muted
  );

  y -= 13;

  if (order.customer_phone) {
    drawText(
      order.customer_phone,
      leftX + 14,
      8,
      regular,
      muted
    );
  }

  const dateValue =
    order.placed_at ||
    order.created_at;

  const dateText = dateValue
    ? new Date(dateValue).toLocaleString(
        "en-IN",
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      )
    : "—";

  y = infoTop - 17;
  drawLabel("ORDER DETAILS", rightX + 14);
  y -= 17;

  drawText(
    dateText,
    rightX + 14,
    8,
    regular,
    dark
  );

  y -= 18;

  drawLabel("PAYMENT", rightX + 14);
  y -= 14;

  drawText(
    safeText(
      order.payment_method || "Online Payment"
    ),
    rightX + 14,
    8,
    regular,
    dark
  );

  const status = safeText(
    order.payment_status || "Paid"
  ).toUpperCase();

  const statusWidth =
    bold.widthOfTextAtSize(status, 6.5) + 16;

  page.drawRectangle({
    x:
      rightX +
      columnWidth -
      statusWidth -
      14,
    y: infoTop - infoHeight + 14,
    width: statusWidth,
    height: 16,
    color: soft,
  });

  page.drawText(status, {
    x:
      rightX +
      columnWidth -
      statusWidth -
      6,
    y: infoTop - infoHeight + 19,
    size: 6.5,
    font: bold,
    color: black,
  });

  y = infoTop - infoHeight - 26;

  // =========================================================
  // SHIPPING ADDRESS
  // =========================================================

  drawLabel("SHIPPING ADDRESS", margin);
  y -= 15;

  const shippingLines = addressLines(
    order.shipping_address
  );

  if (shippingLines.length) {
    for (const lineText of shippingLines) {
      ensureSpace(13);
      drawText(
        lineText,
        margin,
        8.5,
        regular,
        muted
      );
      y -= 13;
    }
  } else {
    drawText(
      "Shipping address not available",
      margin,
      8.5,
      regular,
      muted
    );
    y -= 13;
  }

  y -= 10;
  drawLine();
  y -= 25;

  // =========================================================
  // ORDER ITEMS
  // =========================================================

  drawLabel("ORDER SUMMARY", margin);
  y -= 17;

  page.drawRectangle({
    x: margin,
    y: y - 9,
    width: contentWidth,
    height: 28,
    color: black,
  });

  page.drawText("PRODUCT", {
    x: margin + 10,
    y,
    size: 7,
    font: bold,
    color: white,
  });

  drawRight(
    "QTY",
    pageWidth - 190,
    7,
    bold,
    white
  );

  drawRight(
    "PRICE",
    pageWidth - 115,
    7,
    bold,
    white
  );

  drawRight(
    "TOTAL",
    pageWidth - margin - 10,
    7,
    bold,
    white
  );

  y -= 35;

  if (!items.length) {
    drawText(
      "No items",
      margin + 10,
      8.5,
      regular,
      muted
    );
    y -= 25;
  }

  for (const item of items) {
    const title = safeText(
      item.product_name || "Product"
    );

    const meta = [
      item.brand_name,
      item.flavor,
      item.size,
      item.servings
        ? `${item.servings} servings`
        : null,
      item.sku
        ? `SKU ${item.sku}`
        : null,
    ]
      .filter(Boolean)
      .join(" · ");

    const itemHeight = meta ? 43 : 28;

    ensureSpace(itemHeight + 10);

    drawText(
      title.slice(0, 62),
      margin + 10,
      8.5,
      bold,
      dark
    );

    const valueY = y;

    if (meta) {
      y -= 12;

      drawText(
        meta.slice(0, 82),
        margin + 10,
        6.7,
        regular,
        lightMuted
      );
    }

    drawRight(
      String(item.quantity),
      pageWidth - 190,
      8.5,
      regular,
      dark
    );

    drawRight(
      money(
        item.unit_price,
        order.currency || "INR"
      ),
      pageWidth - 115,
      8.5,
      regular,
      dark
    );

    drawRight(
      money(
        item.total_price,
        order.currency || "INR"
      ),
      pageWidth - margin - 10,
      8.5,
      bold,
      dark
    );

    y = valueY - 18;

    page.drawLine({
      start: {
        x: margin + 10,
        y,
      },
      end: {
        x: pageWidth - margin - 10,
        y,
      },
      thickness: 0.45,
      color: line,
    });

    y -= 13;
  }

  // =========================================================
  // TOTALS
  // =========================================================

  ensureSpace(150);

  y -= 7;
  drawLine();
  y -= 23;

  const totalsX = 350;
  const totalsRight = pageWidth - margin;

  const totalRow = (
    label: string,
    value: string,
    isTotal = false
  ) => {
    const font = isTotal ? bold : regular;
    const size = isTotal ? 11.5 : 8.5;

    page.drawText(label, {
      x: totalsX,
      y,
      size,
      font,
      color: isTotal ? black : muted,
    });

    const width = font.widthOfTextAtSize(
      value,
      size
    );

    page.drawText(value, {
      x: totalsRight - width,
      y,
      size,
      font,
      color: black,
    });

    y -= isTotal ? 23 : 18;
  };

  totalRow(
    "Subtotal",
    money(
      order.subtotal,
      order.currency || "INR"
    )
  );

  totalRow(
    "Shipping",
    Number(order.shipping_fee || 0) > 0
      ? money(
          order.shipping_fee,
          order.currency || "INR"
        )
      : "FREE"
  );

  if (
    Number(order.discount_amount || 0) > 0
  ) {
    totalRow(
      "Discount",
      `-${money(
        order.discount_amount,
        order.currency || "INR"
      )}`
    );
  }

  y -= 2;
  drawLine();
  y -= 21;

  // Solid black total bar — no logo, no decorative branding.
  page.drawRectangle({
    x: totalsX - 12,
    y: y - 14,
    width:
      pageWidth -
      margin -
      totalsX +
      12,
    height: 39,
    color: black,
  });

  page.drawText("TOTAL", {
    x: totalsX,
    y,
    size: 10,
    font: bold,
    color: white,
  });

  const finalTotal = money(
    order.total_amount,
    order.currency || "INR"
  );

  const finalTotalWidth =
    bold.widthOfTextAtSize(
      finalTotal,
      13
    );

  page.drawText(finalTotal, {
    x: totalsRight - finalTotalWidth,
    y,
    size: 13,
    font: bold,
    color: white,
  });

  y -= 48;

  // =========================================================
  // PAYMENT VERIFICATION
  // =========================================================

  if (order.razorpay_payment_id) {
    ensureSpace(60);

    page.drawRectangle({
      x: margin,
      y: y - 44,
      width: contentWidth,
      height: 44,
      color: soft,
      borderColor: line,
      borderWidth: 0.6,
    });

    page.drawText(
      "PAYMENT VERIFIED",
      {
        x: margin + 13,
        y: y - 15,
        size: 6.5,
        font: bold,
        color: muted,
      }
    );

    page.drawText(
      "Razorpay Payment ID",
      {
        x: margin + 13,
        y: y - 29,
        size: 6.5,
        font: regular,
        color: muted,
      }
    );

    const paymentId = safeText(
      order.razorpay_payment_id
    ).slice(0, 48);

    drawRight(
      paymentId,
      pageWidth - margin - 13,
      7,
      regular,
      dark
    );

    y -= 64;
  }

  // =========================================================
  // FOOTER
  // =========================================================

  ensureSpace(80);

  y -= 5;
  drawLine();
  y -= 25;

  page.drawText(
    "Thank you for your order.",
    {
      x: margin,
      y,
      size: 10,
      font: bold,
      color: black,
    }
  );

  y -= 14;

  page.drawText(
    "7BucksNutrition",
    {
      x: margin,
      y,
      size: 8.5,
      font: bold,
      color: dark,
    }
  );

  y -= 12;

  page.drawText(
    "Premium sports nutrition & supplements.",
    {
      x: margin,
      y,
      size: 7,
      font: regular,
      color: muted,
    }
  );

  drawRight(
    `Invoice #${order.order_number}`,
    pageWidth - margin,
    6.5,
    regular,
    lightMuted
  );

  const footerY = 22;

  page.drawLine({
    start: {
      x: margin,
      y: footerY + 13,
    },
    end: {
      x: pageWidth - margin,
      y: footerY + 13,
    },
    thickness: 0.5,
    color: line,
  });

  page.drawText(
    "7BucksNutrition",
    {
      x: margin,
      y: footerY,
      size: 6.5,
      font: bold,
      color: black,
    }
  );

  drawRight(
    "Official Order Invoice",
    pageWidth - margin,
    6.5,
    regular,
    lightMuted
  );

  const bytes = await pdf.save();

  return Buffer.from(bytes);
}
