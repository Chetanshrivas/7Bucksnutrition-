import { PDFDocument, PDFFont, PDFImage, StandardFonts, rgb } from "pdf-lib";
import { INVOICE_LOGO_BASE64 } from "../lib/invoice-logo";

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

const SELLER = {
  name: "7BucksNutrition",
  tagline: "SPORTS NUTRITION & SUPPLEMENTS",
  addressLines: ["Faridabad, Haryana, India"] as string[],
  state: "Haryana",
  gstin: "",
  emails: [
    "support@7bucksnutrition.com",
    "sevenbucksnutrition@gmail.com",
  ] as string[],
  whatsapp: "919990797774",
  whatsappDisplay: "+91 99907 97774",
};

const GST_RATE = 0.18;
const BADGES = [
  "100% AUTHENTIC PRODUCTS",
  "SECURE PAYMENT",
  "ORDER VERIFIED",
];

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
    .replace(
      /[^\x20-\x7E\u00A0-\u00FF\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u2026]/g,
      "?"
    )
    .trim();
}

function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
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

  pdf.setTitle(`Invoice ${order.order_number}`);
  pdf.setAuthor(SELLER.name);
  pdf.setSubject(`Tax invoice for order ${order.order_number}`);
  pdf.setCreator(SELLER.name);
  pdf.setProducer(SELLER.name);

  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const mono = await pdf.embedFont(StandardFonts.CourierBold);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 46;
  const contentWidth = pageWidth - margin * 2;

  const black = rgb(0.055, 0.055, 0.055);
  const dark = rgb(0.12, 0.12, 0.12);
  const muted = rgb(0.42, 0.42, 0.42);
  const lightMuted = rgb(0.62, 0.62, 0.62);
  const line = rgb(0.86, 0.86, 0.86);
  const soft = rgb(0.965, 0.965, 0.965);
  const white = rgb(1, 1, 1);
  const green = rgb(0.09, 0.5, 0.3);
  const greenSoft = rgb(0.91, 0.965, 0.935);
  const greenLine = rgb(0.66, 0.83, 0.74);

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
    font: PDFFont = regular,
    color = dark,
    at: number = y
  ) => {
    page.drawText(safeText(text), {
      x,
      y: at,
      size,
      font,
      color,
    });
  };

  const drawRight = (
    text: string,
    rightX: number,
    size: number,
    font: PDFFont = regular,
    color = dark,
    at: number = y
  ) => {
    const safe = safeText(text);
    const width = font.widthOfTextAtSize(safe, size);

    page.drawText(safe, {
      x: rightX - width,
      y: at,
      size,
      font,
      color,
    });
  };

  const drawLine = (
    color = line,
    thickness = 0.7,
    at: number = y
  ) => {
    page.drawLine({
      start: { x: margin, y: at },
      end: { x: pageWidth - margin, y: at },
      thickness,
      color,
    });
  };

  const drawLabel = (
    text: string,
    x: number,
    at: number = y
  ) => {
    page.drawText(safeText(text), {
      x,
      y: at,
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

  const drawCheck = (
    cx: number,
    cy: number,
    s: number,
    color = white
  ) => {
    page.drawLine({
      start: { x: cx - s * 0.45, y: cy },
      end: { x: cx - s * 0.1, y: cy - s * 0.38 },
      thickness: 1.2,
      color,
    });
    page.drawLine({
      start: { x: cx - s * 0.1, y: cy - s * 0.38 },
      end: { x: cx + s * 0.5, y: cy + s * 0.42 },
      thickness: 1.2,
      color,
    });
  };

  const currency = order.currency || "INR";

  // =========================================================
  // HEADER
  // =========================================================

  const top = pageHeight - margin;

  let logoImage: PDFImage | null = null;
  const logoB64 = INVOICE_LOGO_BASE64.trim();

  if (logoB64) {
    try {
      const logoBytes = Buffer.from(logoB64, "base64");
      logoImage = logoB64.startsWith("/9j/")
        ? await pdf.embedJpg(logoBytes)
        : await pdf.embedPng(logoBytes);
    } catch {
      logoImage = null;
    }
  }

  let brandX = margin + 42;

  if (logoImage) {
    const dims = logoImage.scaleToFit(44, 26);

    page.drawImage(logoImage, {
      x: margin,
      y: top - 30 + (32 - dims.height) / 2,
      width: dims.width,
      height: dims.height,
    });

    brandX = margin + dims.width + 10;
  } else {
    page.drawRectangle({
      x: margin,
      y: top - 30,
      width: 32,
      height: 32,
      color: black,
    });

    const markWidth = bold.widthOfTextAtSize("7B", 13);

    page.drawText("7B", {
      x: margin + (32 - markWidth) / 2,
      y: top - 30 + 11,
      size: 13,
      font: bold,
      color: white,
    });
  }

  drawText(SELLER.name, brandX, 17, bold, black, top - 12);
  drawText(SELLER.tagline, brandX, 6.5, bold, lightMuted, top - 26);

  const sellerLines = [
    ...SELLER.addressLines,
    clean(SELLER.gstin) ? `GSTIN: ${clean(SELLER.gstin)}` : "",
    SELLER.emails.filter(Boolean).join("  ·  "),
    SELLER.whatsappDisplay ? `WhatsApp: ${SELLER.whatsappDisplay}` : "",
  ]
    .filter(Boolean)
    .slice(0, 4);

  sellerLines.forEach((text, index) => {
    drawText(text, margin, 7.5, regular, muted, top - 48 - index * 11);
  });

  drawRight("TAX INVOICE", pageWidth - margin, 7, bold, muted, top - 6);
  drawRight(
    `#${order.order_number}`,
    pageWidth - margin,
    10.5,
    mono,
    black,
    top - 21
  );

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

  drawRight(dateText, pageWidth - margin, 8, regular, muted, top - 35);

  const status = safeText(
    order.payment_status || "Paid"
  ).toUpperCase();

  const isPaid = status === "PAID";
  const statusWidth = bold.widthOfTextAtSize(status, 7) + 32;
  const pillX = pageWidth - margin - statusWidth;
  const pillY = top - 60;

  page.drawRectangle({
    x: pillX,
    y: pillY,
    width: statusWidth,
    height: 17,
    color: isPaid ? greenSoft : soft,
    borderColor: isPaid ? greenLine : line,
    borderWidth: 0.6,
  });

  if (isPaid) {
    page.drawCircle({
      x: pillX + 10,
      y: pillY + 8.5,
      size: 5.5,
      color: green,
    });
    drawCheck(pillX + 10, pillY + 8.8, 7);
  }

  page.drawText(status, {
    x: pillX + (isPaid ? 20 : 12),
    y: pillY + 5.6,
    size: 7,
    font: bold,
    color: isPaid ? green : black,
  });

  const sellerBottom =
    top - 48 - Math.max(0, sellerLines.length - 1) * 11;

  y = Math.min(sellerBottom, top - 62) - 14;
  drawLine(black, 1.1);
  y -= 26;

  // =========================================================
  // CUSTOMER + ORDER INFORMATION
  // =========================================================

  const columnGap = 30;
  const columnWidth =
    (contentWidth - columnGap) / 2;

  const infoTop = y;
  const infoHeight = 92;
  const leftX = margin;
  const rightX = margin + columnWidth + columnGap;

  drawBox(leftX, infoTop - infoHeight, columnWidth, infoHeight);
  drawBox(rightX, infoTop - infoHeight, columnWidth, infoHeight);

  drawLabel("BILL TO", leftX + 14, infoTop - 18);

  drawText(
    order.customer_name || "Customer",
    leftX + 14,
    11,
    bold,
    black,
    infoTop - 36
  );

  drawText(
    order.customer_email || "—",
    leftX + 14,
    8,
    regular,
    muted,
    infoTop - 52
  );

  if (order.customer_phone) {
    drawText(
      order.customer_phone,
      leftX + 14,
      8,
      regular,
      muted,
      infoTop - 65
    );
  }

  drawLabel("ORDER DATE", rightX + 14, infoTop - 18);

  drawText(dateText, rightX + 14, 9, bold, dark, infoTop - 33);

  drawLabel("PAYMENT", rightX + 14, infoTop - 55);

  drawText(
    safeText(order.payment_method || "Online Payment"),
    rightX + 14,
    9,
    bold,
    dark,
    infoTop - 69
  );

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
      drawText(lineText, margin, 8.5, regular, muted);
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

  const qtyRight = 372;
  const priceRight = 448;
  const totalRight = pageWidth - margin - 10;

  ensureSpace(90);

  drawLabel("ORDER SUMMARY", margin);
  y -= 10;

  const barTop = y;

  page.drawRectangle({
    x: margin,
    y: barTop - 24,
    width: contentWidth,
    height: 24,
    color: black,
  });

  drawText("PRODUCT", margin + 10, 7, bold, white, barTop - 15);
  drawRight("QTY", qtyRight, 7, bold, white, barTop - 15);
  drawRight("PRICE", priceRight, 7, bold, white, barTop - 15);
  drawRight("TOTAL", totalRight, 7, bold, white, barTop - 15);

  y = barTop - 24 - 22;

  if (!items.length) {
    drawText("No items", margin + 10, 8.5, regular, muted);
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

    ensureSpace(50);

    drawText(title.slice(0, 62), margin + 10, 8.5, bold, dark);

    if (meta) {
      drawText(meta.slice(0, 82), margin + 10, 6.7, regular, lightMuted, y - 12);
    }

    drawRight(String(item.quantity), qtyRight, 8.5, regular, dark);
    drawRight(money(item.unit_price, currency), priceRight, 8.5, regular, dark);
    drawRight(money(item.total_price, currency), totalRight, 8.5, bold, dark);

    const sepY = y - (meta ? 25 : 15);

    page.drawLine({
      start: { x: margin + 10, y: sepY },
      end: { x: pageWidth - margin - 10, y: sepY },
      thickness: 0.45,
      color: line,
    });

    y = sepY - 20;
  }

  // =========================================================
  // TOTALS
  // =========================================================

  ensureSpace(170);

  y -= 2;
  drawLine();
  y -= 23;

  const totalsX = 330;
  const totalsRight = pageWidth - margin;
  const totalsStartY = y;

  const totalRow = (
    label: string,
    value: string
  ) => {
    page.drawText(label, {
      x: totalsX,
      y,
      size: 8.5,
      font: regular,
      color: muted,
    });

    const width = regular.widthOfTextAtSize(value, 8.5);

    page.drawText(value, {
      x: totalsRight - width,
      y,
      size: 8.5,
      font: regular,
      color: black,
    });

    y -= 18;
  };

  totalRow("Subtotal", money(order.subtotal, currency));

  totalRow(
    "Shipping",
    Number(order.shipping_fee || 0) > 0
      ? money(order.shipping_fee, currency)
      : "FREE"
  );

  if (Number(order.discount_amount || 0) > 0) {
    totalRow(
      "Discount",
      `-${money(order.discount_amount, currency)}`
    );
  }

  const gstEnabled = Boolean(clean(SELLER.gstin));

  if (gstEnabled) {
    const gross = Number(order.total_amount || 0);
    const taxable = round2(gross / (1 + GST_RATE));
    const tax = round2(gross - taxable);
    const intraState =
      clean(order.shipping_address?.state).toLowerCase() ===
      SELLER.state.toLowerCase();

    const ratePct = Math.round(GST_RATE * 100);

    const taxRows: [string, string][] = [
      ["Taxable value", money(taxable, currency)],
    ];

    if (intraState) {
      const half = round2(tax / 2);
      taxRows.push(
        [`CGST ${ratePct / 2}%`, money(half, currency)],
        [`SGST ${ratePct / 2}%`, money(round2(tax - half), currency)]
      );
    } else {
      taxRows.push([`IGST ${ratePct}%`, money(tax, currency)]);
    }

    drawLabel("TAX BREAKDOWN (INCLUDED IN TOTAL)", margin, totalsStartY);

    taxRows.forEach(([label, value], index) => {
      const rowY = totalsStartY - 17 - index * 15;
      drawText(label, margin, 8, regular, muted, rowY);
      drawRight(value, margin + 190, 8, regular, dark, rowY);
    });
  }

  y -= 2;
  page.drawLine({
    start: { x: totalsX, y: y + 10 },
    end: { x: totalsRight, y: y + 10 },
    thickness: 0.7,
    color: line,
  });
  y -= 12;

  page.drawRectangle({
    x: totalsX - 12,
    y: y - 12,
    width: pageWidth - margin - totalsX + 12,
    height: 34,
    color: black,
  });

  drawText("TOTAL", totalsX, 10, bold, white);

  drawRight(
    money(order.total_amount, currency),
    totalsRight - 10,
    13,
    bold,
    white
  );

  y -= 38;

  // =========================================================
  // VERIFICATION
  // =========================================================

  const boxH = 72;

  ensureSpace(boxH + 70);

  page.drawRectangle({
    x: margin,
    y: y - boxH,
    width: contentWidth,
    height: boxH,
    color: greenSoft,
    borderColor: greenLine,
    borderWidth: 0.7,
  });

  const iconX = margin + 30;
  const iconY = y - boxH / 2;

  page.drawCircle({ x: iconX, y: iconY, size: 15, color: green });
  drawCheck(iconX, iconY + 0.5, 16);

  const textX = margin + 58;
  const hasPaymentId = Boolean(order.razorpay_payment_id);

  drawText(
    hasPaymentId ? "PAYMENT VERIFIED" : "ORDER CONFIRMED",
    textX,
    9,
    bold,
    green,
    y - 23
  );

  drawText(
    hasPaymentId
      ? "Secure online payment processed through Razorpay."
      : "Your order has been received and confirmed.",
    textX,
    7.5,
    regular,
    muted,
    y - 37
  );

  if (hasPaymentId) {
    drawText("RAZORPAY PAYMENT ID", textX, 6, bold, muted, y - 53);

    drawText(
      safeText(order.razorpay_payment_id).slice(0, 48),
      textX + 82,
      9,
      mono,
      dark,
      y - 54
    );
  }

  if (SELLER.whatsappDisplay) {
    const helpX = margin + 352;

    page.drawLine({
      start: { x: helpX - 16, y: y - 14 },
      end: { x: helpX - 16, y: y - boxH + 14 },
      thickness: 0.6,
      color: greenLine,
    });

    drawText("NEED HELP WITH THIS ORDER?", helpX, 6, bold, muted, y - 26);
    drawText("WhatsApp us on", helpX, 7.5, regular, muted, y - 40);
    drawText(SELLER.whatsappDisplay, helpX, 10, bold, black, y - 54);
  }

  y -= boxH + 20;

  // =========================================================
  // TRUST BADGES
  // =========================================================

  let badgeX = margin;

  for (const badge of BADGES) {
    const width = bold.widthOfTextAtSize(badge, 6.3) + 18;

    page.drawRectangle({
      x: badgeX,
      y: y - 5,
      width,
      height: 16,
      color: white,
      borderColor: line,
      borderWidth: 0.7,
    });

    page.drawText(badge, {
      x: badgeX + 9,
      y: y - 0.2,
      size: 6.3,
      font: bold,
      color: dark,
    });

    badgeX += width + 8;
  }

  y -= 24;

  if (y < 116) newPage();

  y = 100;
  drawLine();
  y -= 24;

  drawText("Thank you for your order.", margin, 10, bold, black);

  drawRight(
    `Invoice #${order.order_number}`,
    pageWidth - margin,
    6.5,
    regular,
    lightMuted
  );

  y -= 14;

  const support = [
    SELLER.whatsappDisplay ? `WhatsApp ${SELLER.whatsappDisplay}` : "",
    ...SELLER.emails,
  ]
    .filter(Boolean)
    .join("  ·  ");

  drawText(
    support ? `Need help? ${support}` : "Premium sports nutrition & supplements.",
    margin,
    8,
    regular,
    muted
  );

  y -= 12;

  drawText(
    "This is a computer-generated invoice and does not require a signature.",
    margin,
    6.7,
    regular,
    lightMuted
  );

  const footerY = 22;

  drawLine(line, 0.5, footerY + 13);

  drawText(SELLER.name, margin, 6.5, bold, black, footerY);

  drawRight(
    "Official Order Invoice",
    pageWidth - margin,
    6.5,
    regular,
    lightMuted,
    footerY
  );

  const bytes = await pdf.save();

  return Buffer.from(bytes);
}