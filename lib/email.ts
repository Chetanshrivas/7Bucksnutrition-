import { Resend } from "resend";
import {
  generateInvoicePdf,
  InvoiceItem,
  InvoiceOrder,
} from "./invoice";

const ADMIN_ORDER_EMAIL = "sevenbucksnutrition@gmail.com";
const FROM_EMAIL = "7BucksNutrition <orders@7bucksnutrition.com>";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing RESEND_API_KEY in environment variables."
    );
  }

  return new Resend(apiKey);
}

export type OrderEmailOrder = InvoiceOrder & {
  id: string;
  order_status: string;
  order_items?: InvoiceItem[] | null;
};

function money(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function capitalizeStatus(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function itemRows(items: InvoiceItem[]) {
  if (!items.length) {
    return `
      <tr>
        <td
          colspan="3"
          style="
            padding:24px 0;
            text-align:center;
            color:#77736b;
            font-size:13px;
          "
        >
          No item details available.
        </td>
      </tr>
    `;
  }

  return items
    .map((item) => {
      const meta = [
        item.brand_name,
        item.flavor,
        item.size,
        item.servings ? `${item.servings} servings` : null,
      ]
        .filter(Boolean)
        .join(" · ");

      return `
        <tr>
          <td
            style="
              padding:17px 0;
              border-bottom:1px solid #e9e5dd;
              vertical-align:top;
            "
          >
            <div
              style="
                font-size:14px;
                line-height:1.45;
                font-weight:700;
                color:#171717;
              "
            >
              ${escapeHtml(item.product_name)}
            </div>

            ${
              meta
                ? `
                  <div
                    style="
                      margin-top:5px;
                      font-size:11px;
                      line-height:1.5;
                      color:#88837a;
                    "
                  >
                    ${escapeHtml(meta)}
                  </div>
                `
                : ""
            }

            ${
              item.sku
                ? `
                  <div
                    style="
                      margin-top:5px;
                      font-size:10px;
                      letter-spacing:.6px;
                      color:#aaa49a;
                    "
                  >
                    SKU ${escapeHtml(item.sku)}
                  </div>
                `
                : ""
            }
          </td>

          <td
            style="
              width:55px;
              padding:17px 8px;
              border-bottom:1px solid #e9e5dd;
              text-align:center;
              vertical-align:top;
              font-size:13px;
              color:#625e57;
            "
          >
            ${Number(item.quantity || 0)}
          </td>

          <td
            style="
              width:105px;
              padding:17px 0;
              border-bottom:1px solid #e9e5dd;
              text-align:right;
              vertical-align:top;
              font-size:14px;
              font-weight:700;
              color:#171717;
            "
          >
            ${money(Number(item.total_price || 0))}
          </td>
        </tr>
      `;
    })
    .join("");
}

function brandHeader() {
  return `
    <div
      style="
        padding:0;
        background:#ffffff;
        border-bottom:2px solid #111111;
      "
    >
      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
      >
        <tr>
          <td
            style="
              padding:22px 22px;
              vertical-align:middle;
            "
          >
            <div
              style="
                font-size:20px;
                line-height:1.1;
                letter-spacing:-.4px;
                font-weight:800;
                color:#111111;
              "
            >
              7Bucks<span style="color:#555555;">Nutrition</span>
            </div>

            <div
              style="
                margin-top:8px;
                font-size:9px;
                line-height:1.4;
                letter-spacing:2.4px;
                font-weight:700;
                color:#a9a39a;
              "
            >
              SPORTS NUTRITION · PERFORMANCE · LIFESTYLE
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;
}

function baseLayout(content: string) {
  return `<!doctype html>
<html>
  <head>
    <meta
      http-equiv="Content-Type"
      content="text/html; charset=UTF-8"
    />

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />

    <title>7BucksNutrition</title>
  </head>

  <body
    style="
      margin:0;
      padding:0;
      background:#f5f5f5;
      font-family:Arial,Helvetica,sans-serif;
      color:#171717;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="
        width:100%;
        background:#f5f5f5;
      "
    >
      <tr>
        <td
          align="center"
          style="
            padding:36px 14px;
          "
        >
          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
              width:100%;
              max-width:660px;
              background:#ffffff;
              border:1px solid #dfdbd3;
              border-radius:8px;
              overflow:hidden;
            "
          >
            <tr>
              <td>
                ${brandHeader()}
              </td>
            </tr>

            <tr>
              <td>
                ${content}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:28px 32px;
                  background:#f8f7f4;
                  border-top:1px solid #e7e3db;
                "
              >
                <div
                  style="
                    font-size:13px;
                    font-weight:700;
                    color:#25231f;
                  "
                >
                  7BucksNutrition
                </div>

                <div
                  style="
                    margin-top:7px;
                    font-size:11px;
                    line-height:1.7;
                    color:#88837a;
                  "
                >
                  Fuel your goals. Stay consistent. Stay strong.
                </div>

                <div
                  style="
                    margin-top:18px;
                    padding-top:15px;
                    border-top:1px solid #e5e1d9;
                    font-size:10px;
                    line-height:1.7;
                    color:#aaa49b;
                  "
                >
                  This is an automated email from 7BucksNutrition.
                  Please do not reply directly to this message.
                </div>
              </td>
            </tr>
          </table>

          <div
            style="
              max-width:660px;
              margin:16px auto 0;
              text-align:center;
              font-size:9px;
              line-height:1.6;
              color:#aaa49b;
            "
          >
            © ${new Date().getFullYear()} 7BucksNutrition. All rights reserved.
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function orderMeta(order: OrderEmailOrder) {
  const placedAt = order.placed_at || order.created_at;

  const formattedDate = placedAt
    ? new Date(placedAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  return `
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
    >
      <tr>
        <td style="width:50%;padding-right:8px;">
          <div
            style="
              padding:15px;
              border:1px solid #e5e1d9;
              background:#faf9f6;
              border-radius:7px;
            "
          >
            <div
              style="
                font-size:9px;
                letter-spacing:1.4px;
                font-weight:700;
                color:#99938a;
              "
            >
              ORDER NUMBER
            </div>

            <div
              style="
                margin-top:7px;
                font-size:14px;
                font-weight:800;
                color:#181715;
              "
            >
              #${escapeHtml(order.order_number)}
            </div>
          </div>
        </td>

        <td style="width:50%;padding-left:8px;">
          <div
            style="
              padding:15px;
              border:1px solid #e5e1d9;
              background:#faf9f6;
              border-radius:7px;
            "
          >
            <div
              style="
                font-size:9px;
                letter-spacing:1.4px;
                font-weight:700;
                color:#99938a;
              "
            >
              ORDER DATE
            </div>

            <div
              style="
                margin-top:7px;
                font-size:14px;
                font-weight:800;
                color:#181715;
              "
            >
              ${formattedDate}
            </div>
          </div>
        </td>
      </tr>
    </table>
  `;
}

export async function sendOrderConfirmationEmails(
  order: OrderEmailOrder,
  items: InvoiceItem[]
) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY in environment variables.");
  }

  const invoice = await generateInvoicePdf(order, items);
  const invoiceBase64 = invoice.toString("base64");

  const customerName = escapeHtml(
    order.customer_name || "Customer"
  );

  const orderNumber = escapeHtml(order.order_number);

  const customerHtml = baseLayout(`
    <div style="padding:28px 22px 26px;">
      <div
        style="
          display:inline-block;
          padding:7px 11px;
          border:1px solid #ded7c9;
          border-radius:999px;
          background:#faf8f3;
          font-size:9px;
          line-height:1;
          letter-spacing:1.8px;
          font-weight:800;
          color:#9b783f;
        "
      >
        PAYMENT CONFIRMED
      </div>

      <h1
        style="
          margin:18px 0 0;
          font-size:14px;
          line-height:1.12;
          letter-spacing:-.8px;
          color:#141414;
          font-weight:800;
        "
      >
        Your order is confirmed,
        <br />
        ${customerName}.
      </h1>

      <p
        style="
          margin:16px 0 0;
          font-size:14px;
          line-height:1.8;
          color:#68635b;
        "
      >
        Thank you for choosing
        <strong style="color:#24221f;">
          7BucksNutrition
        </strong>.
        Your payment has been successfully received and your order is now confirmed.
      </p>

      <div style="height:18px;">&nbsp;</div>

      <div
        style="
          padding:22px;
          border-radius:8px;
          background:#f8f8f8;
          color:#171717;
        "
      >
        <div
          style="
            font-size:9px;
            letter-spacing:2px;
            font-weight:700;
            color:#aaa59c;
          "
        >
          ORDER TOTAL
        </div>

        <div
          style="
            margin-top:7px;
            font-size:19px;
            line-height:1.1;
            font-weight:800;
            letter-spacing:-.5px;
            color:#171717;
          "
        >
          ${money(order.total_amount)}
        </div>

        <div
          style="
            margin-top:14px;
            font-size:11px;
            color:#555555;
          "
        >
          ● PAYMENT SUCCESSFUL
        </div>
      </div>

      <div style="height:16px;">&nbsp;</div>

      ${orderMeta(order)}

      <div style="height:18px;">&nbsp;</div>

      <div
        style="
          font-size:10px;
          letter-spacing:1.7px;
          font-weight:800;
          color:#99938a;
        "
      >
        YOUR ORDER
      </div>

      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="
          width:100%;
          margin-top:7px;
          border-collapse:collapse;
        "
      >
        <tr>
          <td
            style="
              padding:10px 0;
              border-bottom:1px solid #dcd7ce;
              font-size:9px;
              letter-spacing:1px;
              font-weight:800;
              color:#9a948a;
            "
          >
            PRODUCT
          </td>

          <td
            style="
              padding:10px 8px;
              border-bottom:1px solid #dcd7ce;
              text-align:center;
              font-size:9px;
              letter-spacing:1px;
              font-weight:800;
              color:#9a948a;
            "
          >
            QTY
          </td>

          <td
            style="
              padding:10px 0;
              border-bottom:1px solid #dcd7ce;
              text-align:right;
              font-size:9px;
              letter-spacing:1px;
              font-weight:800;
              color:#9a948a;
            "
          >
            TOTAL
          </td>
        </tr>

        ${itemRows(items)}
      </table>

      <div
        style="
          margin-top:20px;
          padding-top:17px;
          border-top:1px solid #dcd7ce;
        "
      >
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
        >
          <tr>
            <td
              style="
                padding:4px 0;
                font-size:12px;
                color:#777168;
              "
            >
              Subtotal
            </td>

            <td
              style="
                padding:4px 0;
                text-align:right;
                font-size:12px;
                color:#393631;
              "
            >
              ${money(order.subtotal)}
            </td>
          </tr>

          <tr>
            <td
              style="
                padding:4px 0;
                font-size:12px;
                color:#777168;
              "
            >
              Shipping
            </td>

            <td
              style="
                padding:4px 0;
                text-align:right;
                font-size:12px;
                color:#393631;
              "
            >
              ${
                Number(order.shipping_fee || 0) > 0
                  ? money(order.shipping_fee)
                  : "FREE"
              }
            </td>
          </tr>

          ${
            Number(order.discount_amount || 0) > 0
              ? `
                <tr>
                  <td
                    style="
                      padding:4px 0;
                      font-size:12px;
                      color:#777168;
                    "
                  >
                    Discount
                  </td>

                  <td
                    style="
                      padding:4px 0;
                      text-align:right;
                      font-size:12px;
                      color:#53775c;
                    "
                  >
                    -${money(order.discount_amount)}
                  </td>
                </tr>
              `
              : ""
          }

          <tr>
            <td
              style="
                padding:15px 0 3px;
                font-size:14px;
                font-weight:800;
                color:#171717;
              "
            >
              Total
            </td>

            <td
              style="
                padding:15px 0 3px;
                text-align:right;
                font-size:14px;
                font-weight:800;
                color:#171717;
              "
            >
              ${money(order.total_amount)}
            </td>
          </tr>
        </table>
      </div>

      <div
        style="
          margin-top:28px;
          padding:17px 18px;
          border-left:2px solid #222222;
          background:#faf8f3;
        "
      >
        <div
          style="
            font-size:12px;
            line-height:1.7;
            color:#625d55;
          "
        >
          Your PDF invoice is attached to this email.
          Keep it for your records and future reference.
        </div>
      </div>

      <div
        style="
          margin-top:28px;
          text-align:center;
        "
      >
        <div
          style="
            font-size:10px;
            letter-spacing:1.8px;
            font-weight:800;
            color:#9a948a;
          "
        >
          THANK YOU FOR TRUSTING 7BUCKSNUTRITION
        </div>

        <div
          style="
            margin-top:8px;
            font-size:12px;
            color:#777168;
          "
        >
          Your goals. Your discipline. Your nutrition.
        </div>
      </div>
    </div>
  `);

  const adminHtml = baseLayout(`
    <div style="padding:28px 22px 26px;">
      <div
        style="
          display:inline-block;
          padding:7px 11px;
          border-radius:999px;
          background:#f2eadb;
          border:1px solid #e4d5b9;
          font-size:9px;
          letter-spacing:1.8px;
          font-weight:800;
          color:#9b783f;
        "
      >
        NEW PAID ORDER
      </div>

      <h1
        style="
          margin:18px 0 8px;
          font-size:19px;
          line-height:1.15;
          letter-spacing:-.6px;
          color:#151515;
        "
      >
        Order #${orderNumber}
      </h1>

      <p
        style="
          margin:0;
          font-size:13px;
          line-height:1.7;
          color:#6f6a62;
        "
      >
        A new online payment has been successfully verified through
        <strong style="color:#292722;">
          7BucksNutrition
        </strong>.
      </p>

      <div style="height:18px;">&nbsp;</div>

      <div
        style="
          padding:21px;
          background:#f8f8f8;
          border-radius:8px;
        "
      >
        <div
          style="
            font-size:9px;
            letter-spacing:1.8px;
            font-weight:700;
            color:#aaa59d;
          "
        >
          ORDER VALUE
        </div>

        <div
          style="
            margin-top:6px;
            font-size:14px;
            font-weight:800;
            color:#171717;
          "
        >
          ${money(order.total_amount)}
        </div>

        <div
          style="
            margin-top:10px;
            font-size:10px;
            color:#555555;
          "
        >
          PAYMENT VERIFIED
        </div>
      </div>

      <div style="height:16px;">&nbsp;</div>

      <div
        style="
          padding:20px;
          border:1px solid #e2ded6;
          border-radius:8px;
          background:#faf9f6;
        "
      >
        <div
          style="
            font-size:9px;
            letter-spacing:1.6px;
            font-weight:800;
            color:#99938a;
            margin-bottom:15px;
          "
        >
          CUSTOMER DETAILS
        </div>

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
        >
          <tr>
            <td
              style="
                padding:6px 0;
                width:95px;
                font-size:11px;
                color:#99938a;
              "
            >
              Customer
            </td>

            <td
              style="
                padding:6px 0;
                font-size:12px;
                font-weight:700;
                color:#292722;
              "
            >
              ${escapeHtml(order.customer_name)}
            </td>
          </tr>

          <tr>
            <td
              style="
                padding:6px 0;
                font-size:11px;
                color:#99938a;
              "
            >
              Email
            </td>

            <td
              style="
                padding:6px 0;
                font-size:12px;
                color:#292722;
              "
            >
              ${escapeHtml(order.customer_email)}
            </td>
          </tr>

          <tr>
            <td
              style="
                padding:6px 0;
                font-size:11px;
                color:#99938a;
              "
            >
              Phone
            </td>

            <td
              style="
                padding:6px 0;
                font-size:12px;
                color:#292722;
              "
            >
              ${escapeHtml(order.customer_phone || "—")}
            </td>
          </tr>

          <tr>
            <td
              style="
                padding:6px 0;
                font-size:11px;
                color:#99938a;
              "
            >
              Status
            </td>

            <td
              style="
                padding:6px 0;
                font-size:12px;
                font-weight:700;
                color:#53775c;
                text-transform:capitalize;
              "
            >
              ${escapeHtml(order.order_status)}
            </td>
          </tr>
        </table>
      </div>

      <div style="height:18px;">&nbsp;</div>

      <div
        style="
          font-size:10px;
          letter-spacing:1.7px;
          font-weight:800;
          color:#99938a;
        "
      >
        ORDER ITEMS
      </div>

      <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="
          width:100%;
          margin-top:7px;
          border-collapse:collapse;
        "
      >
        <tr>
          <td
            style="
              padding:10px 0;
              border-bottom:1px solid #dcd7ce;
              font-size:9px;
              letter-spacing:1px;
              font-weight:800;
              color:#9a948a;
            "
          >
            PRODUCT
          </td>

          <td
            style="
              padding:10px 8px;
              border-bottom:1px solid #dcd7ce;
              text-align:center;
              font-size:9px;
              letter-spacing:1px;
              font-weight:800;
              color:#9a948a;
            "
          >
            QTY
          </td>

          <td
            style="
              padding:10px 0;
              border-bottom:1px solid #dcd7ce;
              text-align:right;
              font-size:9px;
              letter-spacing:1px;
              font-weight:800;
              color:#9a948a;
            "
          >
            TOTAL
          </td>
        </tr>

        ${itemRows(items)}
      </table>

      <div
        style="
          margin-top:24px;
          padding-top:18px;
          border-top:1px solid #ded9d0;
          text-align:right;
        "
      >
        <span
          style="
            font-size:10px;
            letter-spacing:1px;
            color:#99938a;
          "
        >
          ORDER TOTAL
        </span>

        <div
          style="
            margin-top:4px;
            font-size:14px;
            font-weight:800;
            color:#171717;
          "
        >
          ${money(order.total_amount)}
        </div>
      </div>

      <div
        style="
          margin-top:26px;
          padding:15px 17px;
          background:#f7f4ed;
          border:1px solid #e7dfd0;
          border-radius:7px;
          font-size:11px;
          line-height:1.7;
          color:#706a61;
        "
      >
        The customer confirmation email has been prepared and the PDF invoice
        is attached to this notification.
      </div>
    </div>
  `);

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: [order.customer_email],
    replyTo: ADMIN_ORDER_EMAIL,
    subject: `Order Confirmed #${order.order_number} | 7BucksNutrition`,
    html: customerHtml,
    attachments: [
      {
        filename: `7BucksNutrition-Invoice-${order.order_number}.pdf`,
        content: invoiceBase64,
      },
    ],
  });

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: [ADMIN_ORDER_EMAIL],
    subject: `New Paid Order #${order.order_number} | 7BucksNutrition`,
    html: adminHtml,
    attachments: [
      {
        filename: `7BucksNutrition-Invoice-${order.order_number}.pdf`,
        content: invoiceBase64,
      },
    ],
  });
}

export async function sendOrderStatusEmail(
  order: OrderEmailOrder,
  newStatus: string
) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY in environment variables.");
  }

  const status = newStatus.replaceAll("_", " ");
  const displayStatus = capitalizeStatus(newStatus);

  const statusColors: Record<
    string,
    { bg: string; border: string; text: string }
  > = {
    pending: {
      bg: "#f6f1e5",
      border: "#e3d5b8",
      text: "#92703b",
    },
    confirmed: {
      bg: "#edf5ee",
      border: "#cfe2d1",
      text: "#477153",
    },
    processing: {
      bg: "#eef3f8",
      border: "#d2ddea",
      text: "#48627e",
    },
    packed: {
      bg: "#f2eff8",
      border: "#ddd5eb",
      text: "#68547f",
    },
    shipped: {
      bg: "#edf4f7",
      border: "#cfdee4",
      text: "#456b79",
    },
    out_for_delivery: {
      bg: "#f8f1e8",
      border: "#ead9c1",
      text: "#946b38",
    },
    delivered: {
      bg: "#edf6ee",
      border: "#cce3cf",
      text: "#397047",
    },
    cancelled: {
      bg: "#f8eeee",
      border: "#ead1d1",
      text: "#955353",
    },
    returned: {
      bg: "#f4efef",
      border: "#ded2d2",
      text: "#755e5e",
    },
  };

  const statusStyle =
    statusColors[newStatus] || {
      bg: "#f3f2ef",
      border: "#dedbd5",
      text: "#625e57",
    };

  const customerHtml = baseLayout(`
    <div style="padding:28px 22px 26px;">
      <div
        style="
          display:inline-block;
          padding:7px 11px;
          border:1px solid ${statusStyle.border};
          border-radius:999px;
          background:${statusStyle.bg};
          font-size:9px;
          line-height:1;
          letter-spacing:1.8px;
          font-weight:800;
          color:${statusStyle.text};
        "
      >
        ORDER UPDATE
      </div>

      <h1
        style="
          margin:18px 0 0;
          font-size:14px;
          line-height:1.15;
          letter-spacing:-.7px;
          color:#151515;
          font-weight:800;
        "
      >
        Your order status
        <br />
        has changed.
      </h1>

      <p
        style="
          margin:16px 0 0;
          font-size:14px;
          line-height:1.8;
          color:#68635b;
        "
      >
        Hi
        <strong style="color:#272521;">
          ${escapeHtml(order.customer_name || "Customer")}
        </strong>,
        your 7BucksNutrition order
        <strong style="color:#272521;">
          #${escapeHtml(order.order_number)}
        </strong>
        has been updated.
      </p>

      <div style="height:18px;">&nbsp;</div>

      <div
        style="
          padding:25px 20px;
          border-radius:8px;
          background:#f8f8f8;
          text-align:center;
        "
      >
        <div
          style="
            font-size:9px;
            letter-spacing:2px;
            font-weight:700;
            color:#aaa59d;
          "
        >
          CURRENT STATUS
        </div>

        <div
          style="
            margin-top:9px;
            font-size:14px;
            line-height:1.2;
            font-weight:800;
            color:#171717;
            text-transform:capitalize;
          "
        >
          ${escapeHtml(displayStatus)}
        </div>

        <div
          style="
            margin-top:10px;
            font-size:10px;
            color:#555555;
          "
        >
          7BucksNutrition
        </div>
      </div>

      <div style="height:16px;">&nbsp;</div>

      ${orderMeta(order)}

      <div
        style="
          margin-top:24px;
          padding:19px;
          border:1px solid #e3dfd7;
          border-radius:8px;
          background:#faf9f6;
        "
      >
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
        >
          <tr>
            <td
              style="
                font-size:11px;
                color:#99938a;
              "
            >
              ORDER TOTAL
            </td>

            <td
              style="
                text-align:right;
                font-size:14px;
                font-weight:800;
                color:#1a1917;
              "
            >
              ${money(order.total_amount)}
            </td>
          </tr>
        </table>
      </div>

      <div
        style="
          margin-top:28px;
          padding:17px 18px;
          border-left:2px solid #222222;
          background:#faf8f3;
        "
      >
        <div
          style="
            font-size:12px;
            line-height:1.7;
            color:#625d55;
          "
        >
          We'll continue to keep you updated as your order moves through the
          fulfillment process.
        </div>
      </div>
      <div style="margin-top:22px;text-align:left;">
        <div style="font-size:11px;color:#777168;">Thank you for shopping with 7BucksNutrition.</div>
      </div>
    </div>
  `);

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: [order.customer_email],
    replyTo: ADMIN_ORDER_EMAIL,
    subject: `Order #${order.order_number} — ${displayStatus} | 7BucksNutrition`,
    html: customerHtml,
  });
}