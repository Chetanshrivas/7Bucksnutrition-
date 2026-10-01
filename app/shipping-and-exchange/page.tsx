import type { Metadata } from "next";
import {
  ArrowUpRight,
  Clock3,
  MapPin,
  MessageCircle,
  PackageCheck,
  RefreshCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Shipping and Exchange | 7BucksNutrition",
  description:
    "Shipping, delivery and product exchange policy for 7BucksNutrition.",
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

export default function ShippingAndExchangePage() {
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
            <h1 className="whitespace-nowrap font-serif text-[clamp(1.7rem,6vw,4.5rem)] leading-none tracking-[-0.045em]">
              <span className="text-white">Shipping</span>{" "}
              <span className="italic text-[#e5ce9e]">&amp; Exchange</span>
            </h1>

            <p className="mt-5 max-w-2xl text-[13px] leading-6 text-white/55 sm:mt-6 sm:text-[15px] sm:leading-7">
              Clear information about delivery, shipping and eligible product
              exchanges — so you know what to expect after placing your order.
            </p>
          </div>
        </div>
      </section>

      {/* Quick information */}
      <section className="border-b border-black/[0.08] bg-white">
        <div className="mx-auto grid max-w-6xl sm:grid-cols-3">
          <div className="flex items-center gap-3 border-b border-black/[0.08] px-5 py-5 sm:border-b-0 sm:border-r sm:px-7 lg:px-10">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5efe5]">
              <Truck className="h-4 w-4 text-[#9a753e]" />
            </span>

            <div>
              <p className="text-xs font-semibold text-black">
                7–10 business days
              </p>

              <p className="mt-0.5 text-[11px] text-black/45">
                Typical delivery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-b border-black/[0.08] px-5 py-5 sm:border-b-0 sm:border-r sm:px-7 lg:px-10">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5efe5]">
              <RefreshCcw className="h-4 w-4 text-[#9a753e]" />
            </span>

            <div>
              <p className="text-xs font-semibold text-black">
                Eligible exchanges
              </p>

              <p className="mt-0.5 text-[11px] text-black/45">
                For genuine issues
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-5 py-5 sm:px-7 lg:px-10">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5efe5]">
              <ShieldCheck className="h-4 w-4 text-[#9a753e]" />
            </span>

            <div>
              <p className="text-xs font-semibold text-black">
                Genuine products
              </p>

              <p className="mt-0.5 text-[11px] text-black/45">
                Packed with care
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Policy content */}
      <section className="px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[26px] bg-white px-5 shadow-[0_20px_70px_-45px_rgba(0,0,0,0.35)] sm:px-8 lg:px-12">
          <PolicySection number="01" title="Order Processing">
            <p>
              Orders are processed after successful payment confirmation and
              order verification.
            </p>

            <p>
              We begin preparing your order once payment is confirmed and the
              products are available.
            </p>
          </PolicySection>

          <PolicySection number="02" title="Delivery">
            <p>
              Our usual delivery time is{" "}
              <strong className="font-semibold text-black">
                7–10 business days
              </strong>
              .
            </p>

            <p>
              Delivery time can vary depending on your delivery address,
              location, courier availability and other operational conditions.
            </p>

            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#f7f3eb] px-4 py-3.5">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#9a753e]" />

              <p className="text-xs leading-5 text-black/60">
                Delivery timelines are estimates and may vary depending on the
                destination.
              </p>
            </div>
          </PolicySection>

          <PolicySection number="03" title="Shipping Charges">
            <p>
              Any applicable shipping charge will be shown during checkout
              before you complete your payment.
            </p>

            <p>
              Promotional or free-shipping offers may have their own
              eligibility conditions.
            </p>
          </PolicySection>

          <PolicySection number="04" title="Delivery Address">
            <p>
              Please make sure your name, complete address, PIN code and mobile
              number are correct when placing your order.
            </p>

            <p>
              An incorrect or incomplete address may cause delivery delays or
              require additional delivery arrangements.
            </p>
          </PolicySection>

          <PolicySection number="05" title="Damaged or Tampered Package">
            <p>
              If your package arrives visibly damaged or tampered with, please
              take photographs of the package and contact us as soon as
              possible.
            </p>

            <p>
              Keeping the original packaging and sharing an unboxing video,
              where available, can help us resolve the issue faster.
            </p>
          </PolicySection>

          <PolicySection number="06" title="Incorrect or Damaged Product">
            <p>
              If you receive a product different from what you ordered, or a
              product is damaged during delivery, please contact us as soon as
              possible and preferably within 48 hours of delivery.
            </p>

            <p>
              After verification, we may arrange an eligible exchange,
              replacement or refund.
            </p>
          </PolicySection>

          <PolicySection number="07" title="Product Exchange">
            <p>
              Exchanges are considered for products that are damaged, defective
              or incorrectly delivered.
            </p>

            <p>
              Since our products include consumable sports nutrition and
              supplements, opened or used products are generally not eligible
              for exchange unless the issue is related to damage, defect or
              incorrect fulfilment.
            </p>

            <p>
              Please contact us and receive approval before sending any product
              back.
            </p>
          </PolicySection>

          <PolicySection number="08" title="Undelivered Orders">
            <p>
              If a courier cannot complete delivery after its applicable
              attempts, the shipment may be returned to us.
            </p>

            <p>
              If re-dispatch is possible, we may need to confirm your delivery
              details before sending the order again.
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
                      Shipping or exchange support
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
              <span className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#a07b46]" />
                Sector 15, Faridabad, Haryana, India
              </span>

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