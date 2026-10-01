import type { Metadata } from "next";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  MessageCircle,
  PackageCheck,
  RefreshCcw,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cancellation and Refund | 7BucksNutrition",
  description:
    "Cancellation, return, replacement and refund policy for 7BucksNutrition.",
};

const SUPPORT_PHONE = "+91 99907 97774";
const SUPPORT_EMAIL = "sevenbucksnutrition@gmail.com";
const WHATSAPP_NUMBER = "919990797774";

function SupportPhone() {
  return (
    <details className="group relative inline-block">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[#171717] transition-colors hover:text-[#9a753e] [&::-webkit-details-marker]:hidden">
        <span className="font-medium">{SUPPORT_PHONE}</span>

        <ArrowUpRight className="h-3.5 w-3.5 text-black/35 transition-transform duration-200 group-open:rotate-45" />
      </summary>

      <div className="absolute bottom-full left-1/2 z-30 mb-3 w-48 -translate-x-1/2 overflow-hidden rounded-2xl border border-black/10 bg-white p-1.5 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.35)]">
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-black/75 transition-colors hover:bg-[#f5f1e9] hover:text-black"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0f7f2]">
            <MessageCircle className="h-4 w-4 text-[#318653]" />
          </span>

          <span>Open WhatsApp</span>
        </a>

        <a
          href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold text-black/75 transition-colors hover:bg-[#f5f1e9] hover:text-black"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f7f3eb]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4 text-[#9a753e]"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.34 1.78.65 2.63a2 2 0 0 1-.45 2.11L8.04 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.31 1.73.53 2.63.65A2 2 0 0 1 22 16.92Z"
              />
            </svg>
          </span>

          <span>Call us</span>
        </a>
      </div>
    </details>
  );
}

function PolicySection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-black/[0.08] py-7 last:border-b-0 sm:py-9">
      <div className="grid gap-3 sm:grid-cols-[64px_1fr] sm:gap-7">
        <span className="pt-1 text-[10px] font-semibold tracking-[0.2em] text-[#a07b46]">
          {number}
        </span>

        <div>
          <h2 className="text-[19px] font-semibold tracking-[-0.02em] text-[#171717] sm:text-[22px]">
            {title}
          </h2>

          <div className="mt-3 space-y-3 text-[14px] leading-6.5 text-black/60 sm:text-[15px] sm:leading-7">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function CancellationAndRefundPage() {
  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#171717]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#11100f] text-white">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(55% 80% at 85% 0%, rgba(214,180,122,0.16), transparent 70%), radial-gradient(45% 65% at 0% 100%, rgba(155,103,62,0.12), transparent 70%)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-5 pb-12 pt-32 sm:px-8 sm:pb-14 sm:pt-36 lg:px-12 lg:pb-16 lg:pt-40">
          <div className="max-w-5xl">
            <h1 className="whitespace-nowrap font-serif text-[clamp(1.65rem,5.7vw,4.5rem)] leading-none tracking-[-0.045em]">
              <span className="text-white">Cancellation</span>{" "}
              <span className="italic text-[#e5ce9e]">&amp; Refund</span>
            </h1>

            <p className="mt-5 max-w-2xl text-[13px] leading-6 text-white/55 sm:mt-6 sm:text-[15px] sm:leading-7">
              A straightforward guide to cancelling an order, requesting a
              refund and resolving delivery-related issues.
            </p>
          </div>
        </div>
      </section>

      {/* Quick information */}
      <section className="border-b border-black/[0.08] bg-white">
        <div className="mx-auto grid max-w-6xl sm:grid-cols-3">
          <div className="flex items-center gap-3 border-b border-black/[0.08] px-5 py-5 sm:border-b-0 sm:border-r sm:px-7 lg:px-10">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5efe5]">
              <RefreshCcw className="h-4 w-4 text-[#9a753e]" />
            </span>

            <div>
              <p className="text-xs font-semibold text-black">
                Cancel before dispatch
              </p>

              <p className="mt-0.5 text-[11px] text-black/45">
                Contact us as soon as possible
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-b border-black/[0.08] px-5 py-5 sm:border-b-0 sm:border-r sm:px-7 lg:px-10">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5efe5]">
              <Clock3 className="h-4 w-4 text-[#9a753e]" />
            </span>

            <div>
              <p className="text-xs font-semibold text-black">
                Refund in 5–7 days
              </p>

              <p className="mt-0.5 text-[11px] text-black/45">
                Maximum 7 business days
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-5 py-5 sm:px-7 lg:px-10">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5efe5]">
              <CreditCard className="h-4 w-4 text-[#9a753e]" />
            </span>

            <div>
              <p className="text-xs font-semibold text-black">
                Original payment method
              </p>

              <p className="mt-0.5 text-[11px] text-black/45">
                Refunds are sent back accordingly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Policy content */}
      <section className="px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[26px] bg-white px-5 shadow-[0_20px_70px_-45px_rgba(0,0,0,0.35)] sm:px-8 lg:px-12">
          <PolicySection number="01" title="Order Cancellation">
            <p>
              You can request cancellation of an order as soon as possible
              before it has been dispatched.
            </p>

            <p>
              If cancellation is accepted before dispatch, the eligible amount
              paid will be refunded to the original payment method.
            </p>

            <p>
              Once an order has been dispatched, cancellation may no longer be
              possible. In that case, the applicable return or exchange process
              may apply.
            </p>
          </PolicySection>

          <PolicySection number="02" title="How to Request Cancellation">
            <p>
              Contact us with your order number and the mobile number or email
              associated with the order.
            </p>

            <p>
              The sooner you contact us, the better the chance that we can
              process a cancellation before dispatch.
            </p>
          </PolicySection>

          <PolicySection number="03" title="Damaged, Incorrect or Defective Products">
            <p>
              If you receive a damaged, tampered, incorrect or defective
              product, please contact us as soon as possible and preferably
              within 48 hours of delivery.
            </p>

            <p>
              Please keep the product, packaging and shipping label. Photos may
              be requested to help us verify the issue.
            </p>

            <p>
              Where appropriate, we may arrange a replacement, exchange or
              refund after verification.
            </p>
          </PolicySection>

          <PolicySection number="04" title="Returns and Exchanges">
            <p>
              Our products include consumable sports nutrition and supplements.
              For this reason, opened or used products are generally not
              eligible for return or exchange unless the issue relates to
              damage, defect or incorrect fulfilment.
            </p>

            <p>
              Please contact us and receive approval before sending any product
              back.
            </p>
          </PolicySection>

          <PolicySection number="05" title="Refund Processing">
            <p>
              Once a refund has been approved, we will initiate it to the
              original payment method used for the order.
            </p>

            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#f7f3eb] px-4 py-3.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#9a753e]" />

              <p className="text-xs leading-5 text-black/65">
                Refunds are generally processed within{" "}
                <strong className="font-semibold text-black">
                  5–7 business days
                </strong>
                , with a maximum processing time of{" "}
                <strong className="font-semibold text-black">
                  7 business days
                </strong>{" "}
                after approval.
              </p>
            </div>

            <p>
              The time for the refunded amount to appear in your account may
              also depend on your bank or payment provider.
            </p>
          </PolicySection>

          <PolicySection number="06" title="Failed or Cancelled Payments">
            <p>
              If a payment fails or is cancelled and no order is successfully
              confirmed by 7BucksNutrition, it will not be treated as a
              completed purchase.
            </p>

            <p>
              If your bank or payment provider temporarily shows a debit or
              payment hold, the amount may be reversed according to the
              provider&apos;s process.
            </p>

            <p>
              If the amount does not resolve within the expected banking
              timeline, contact us with your transaction or payment details.
            </p>
          </PolicySection>

          <PolicySection number="07" title="Shipping Charges">
            <p>
              If an order is cancelled before dispatch, eligible shipping
              charges paid as part of the order may be considered for refund.
            </p>

            <p>
              For returns or situations caused by customer preference, shipping
              or reverse-shipping charges may not be refundable, subject to
              applicable law and the circumstances of the order.
            </p>
          </PolicySection>

          <PolicySection number="08" title="Refunds to the Original Payment Method">
            <p>
              Online payment refunds are normally processed to the same payment
              method used for the transaction.
            </p>

            <p>
              We do not normally transfer refunds to an unrelated third-party
              account or payment method.
            </p>
          </PolicySection>

          <PolicySection number="09" title="Need Help?">
            <div className="rounded-2xl border border-black/[0.08] bg-[#faf9f6] p-4 sm:p-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1e7d6]">
                    <PackageCheck className="h-4 w-4 text-[#9a753e]" />
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-black">
                      Cancellation or refund support
                    </p>

                    <p className="mt-1 text-xs leading-5 text-black/50">
                      Keep your order number ready when contacting us.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 text-xs sm:items-end">
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="font-medium text-black/65 underline decoration-black/15 underline-offset-4 transition-colors hover:text-[#9a753e]"
                  >
                    {SUPPORT_EMAIL}
                  </a>

                  <SupportPhone />
                </div>
              </div>
            </div>
          </PolicySection>

          <div className="border-t border-black/[0.08] py-6">
            <div className="flex flex-col gap-3 text-xs text-black/45 sm:flex-row sm:items-center sm:justify-between">
              <span>7BucksNutrition</span>

              <span>
                Questions?{" "}
                <a
                  href="/contact"
                  className="font-medium text-black/65 underline decoration-black/15 underline-offset-4 transition-colors hover:text-[#9a753e]"
                >
                  Contact us
                </a>
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}