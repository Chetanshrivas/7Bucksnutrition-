import type { Metadata } from "next";
import {
  ArrowUpRight,
  Mail,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | 7BucksNutrition",
  description:
    "Contact 7BucksNutrition for orders, products, payments, shipping and customer support.",
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
            <Phone className="h-4 w-4 text-[#9a753e]" />
          </span>

          <span>Call us</span>
        </a>
      </div>
    </details>
  );
}

export default function ContactPage() {
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
            <h1 className="whitespace-nowrap font-serif text-[clamp(2rem,7vw,5rem)] leading-none tracking-[-0.045em]">
              <span className="text-white">Contact</span>{" "}
              <span className="italic text-[#e5ce9e]">Us</span>
            </h1>

            <p className="mt-5 max-w-2xl text-[13px] leading-6 text-white/55 sm:mt-6 sm:text-[15px] sm:leading-7">
              Have a question about an order, product, payment, delivery or
              refund? We&apos;re here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Main contact area */}
      <section className="px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[26px] bg-white shadow-[0_20px_70px_-45px_rgba(0,0,0,0.35)]">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            {/* Support */}
            <div className="p-6 sm:p-9 lg:p-12">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a07b46]">
                Customer Support
              </p>

              <h2 className="mt-3 max-w-md text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
                We&apos;re here when you need us.
              </h2>

              <p className="mt-4 max-w-lg text-sm leading-6.5 text-black/55 sm:text-[15px] sm:leading-7">
                Whether you need help with an order or simply have a question
                before buying, reach out to our team.
              </p>

              <div className="mt-8 divide-y divide-black/[0.08] border-y border-black/[0.08]">
                {/* Email */}
                <div className="flex items-center gap-4 py-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5efe5]">
                    <Mail className="h-4 w-4 text-[#9a753e]" />
                  </span>

                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">
                      Email
                    </p>

                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="mt-1 block truncate text-sm font-medium text-black/75 transition-colors hover:text-[#9a753e] sm:text-[15px]"
                    >
                      {SUPPORT_EMAIL}
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-4 py-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5efe5]">
                    <Phone className="h-4 w-4 text-[#9a753e]" />
                  </span>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">
                      Phone / WhatsApp
                    </p>

                    <div className="mt-1">
                      <SupportPhone />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-4 py-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5efe5]">
                    <MapPin className="h-4 w-4 text-[#9a753e]" />
                  </span>

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/35">
                      Location
                    </p>

                    <p className="mt-1 text-sm font-medium text-black/75">
                      Sector 15, Faridabad, Haryana, India
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order support */}
            <div className="border-t border-black/[0.08] bg-[#faf9f6] p-6 sm:p-9 lg:border-l lg:border-t-0 lg:p-12">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f1e7d6]">
                <PackageCheck className="h-5 w-5 text-[#9a753e]" />
              </span>

              <p className="mt-7 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a07b46]">
                Order Support
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em] sm:text-3xl">
                Need help with an order?
              </h2>

              <p className="mt-4 text-sm leading-6.5 text-black/55 sm:text-[15px] sm:leading-7">
                When contacting us about an existing order, keep your order
                number ready along with the mobile number or email used during
                checkout.
              </p>

              <div className="mt-7 space-y-3">
                <div className="border-b border-black/[0.08] pb-3 text-sm text-black/60">
                  <span className="font-semibold text-black">Orders</span>
                  <span className="mx-2 text-black/20">·</span>
                  Order status and order-related help
                </div>

                <div className="border-b border-black/[0.08] pb-3 text-sm text-black/60">
                  <span className="font-semibold text-black">Payments</span>
                  <span className="mx-2 text-black/20">·</span>
                  Payment or transaction assistance
                </div>

                <div className="text-sm text-black/60">
                  <span className="font-semibold text-black">Returns</span>
                  <span className="mx-2 text-black/20">·</span>
                  Cancellation, refund and exchange help
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-2 sm:flex-row">
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#171717] px-5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                >
                  Email Support
                </a>

                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-5 text-sm font-semibold text-black/75 transition-colors hover:border-black/20 hover:text-black"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="border-t border-black/[0.08] px-6 py-5 sm:px-9 lg:px-12">
            <div className="flex flex-col gap-2 text-xs text-black/40 sm:flex-row sm:items-center sm:justify-between">
              <span>7BucksNutrition · Customer Support</span>

              <a
                href="/"
                className="font-medium text-black/55 underline decoration-black/10 underline-offset-4 transition-colors hover:text-[#9a753e]"
              >
                Back to store
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}