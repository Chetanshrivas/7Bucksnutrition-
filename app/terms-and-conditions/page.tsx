import type { Metadata } from "next";
import {
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  Gavel,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  UserRound,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions | 7BucksNutrition",
  description: "Terms and Conditions for 7BucksNutrition.",
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
                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.34 1.78.65 2.63a2 2 0 0 1-.45 2.11L8.04 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.31 1.73.53 2.63.65a2 2 0 0 1 2.11.65A2 2 0 0 1 22 16.92Z"
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

export default function TermsAndConditionsPage() {
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
              <span className="text-white">Terms</span>{" "}
              <span className="italic text-[#e5ce9e]">&amp; Conditions</span>
            </h1>

            <p className="mt-5 max-w-2xl text-[13px] leading-6 text-white/55 sm:mt-6 sm:text-[15px] sm:leading-7">
              The terms that apply when you use the 7BucksNutrition website or
              place an order through our online store.
            </p>
          </div>
        </div>
      </section>

      {/* Quick information */}
      <section className="border-b border-black/[0.08] bg-white">
        <div className="mx-auto grid max-w-6xl sm:grid-cols-3">
          <div className="flex items-center gap-3 border-b border-black/[0.08] px-5 py-5 sm:border-b-0 sm:border-r sm:px-7 lg:px-10">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5efe5]">
              <CheckCircle2 className="h-4 w-4 text-[#9a753e]" />
            </span>

            <div>
              <p className="text-xs font-semibold text-black">
                Genuine products
              </p>

              <p className="mt-0.5 text-[11px] text-black/45">
                Subject to availability
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-b border-black/[0.08] px-5 py-5 sm:border-b-0 sm:border-r sm:px-7 lg:px-10">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5efe5]">
              <CreditCard className="h-4 w-4 text-[#9a753e]" />
            </span>

            <div>
              <p className="text-xs font-semibold text-black">
                Secure payments
              </p>

              <p className="mt-0.5 text-[11px] text-black/45">
                Processed through authorised providers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-5 py-5 sm:px-7 lg:px-10">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5efe5]">
              <ShieldCheck className="h-4 w-4 text-[#9a753e]" />
            </span>

            <div>
              <p className="text-xs font-semibold text-black">
                Customer support
              </p>

              <p className="mt-0.5 text-[11px] text-black/45">
                Help with orders and payments
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Terms */}
      <section className="px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[26px] bg-white px-5 shadow-[0_20px_70px_-45px_rgba(0,0,0,0.35)] sm:px-8 lg:px-12">
          <PolicySection number="01" title="About These Terms">
            <p>
              These Terms &amp; Conditions apply to your access to and use of
              the 7BucksNutrition website and to purchases made through the
              website.
            </p>

            <p>
              By accessing the website, creating an account or placing an
              order, you agree to these Terms &amp; Conditions, our Privacy
              Policy and our Cancellation &amp; Refund Policy.
            </p>
          </PolicySection>

          <PolicySection number="02" title="About 7BucksNutrition">
            <p>
              7BucksNutrition is an online sports nutrition and supplement
              store serving customers in India.
            </p>

            <p>
              We offer sports nutrition and fitness products from established
              brands, subject to availability.
            </p>
          </PolicySection>

          <PolicySection number="03" title="Products and Product Information">
            <p>
              We make reasonable efforts to ensure that product names,
              descriptions, images, prices, availability and other information
              displayed on the website are accurate.
            </p>

            <p>
              Product packaging, labels, flavours, formulations and appearance
              may vary from time to time. Products supplied will be genuine
              products available from the relevant brand or authorised supply
              chain.
            </p>

            <p>
              Product images are provided for representation and may differ
              slightly from the actual packaging.
            </p>
          </PolicySection>

          <PolicySection number="04" title="Supplement and Health Disclaimer">
            <p>
              Sports nutrition products and supplements are not intended to
              replace a balanced diet or professional medical advice.
            </p>

            <p>
              Always read the product label, ingredients, warnings and
              recommended usage before consuming a product.
            </p>

            <p>
              If you have a medical condition, are taking medication, are
              pregnant or breastfeeding, or have concerns regarding the use of
              any supplement, consult an appropriate healthcare professional
              before use.
            </p>

            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#f7f3eb] px-4 py-3.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#9a753e]" />

              <p className="text-xs leading-5 text-black/65">
                7BucksNutrition does not provide medical advice and does not
                make medical claims beyond information supplied by the
                manufacturer or displayed on the product packaging.
              </p>
            </div>
          </PolicySection>

          <PolicySection number="05" title="Pricing and Availability">
            <p>
              All prices displayed on the website are in Indian Rupees (INR)
              unless otherwise stated.
            </p>

            <p>
              Product availability and stock levels may change without prior
              notice.
            </p>

            <p>
              We reserve the right to correct obvious pricing, product or
              listing errors. If an order is affected by such an error, we may
              cancel the affected order and provide an appropriate refund for
              any amount already paid.
            </p>
          </PolicySection>

          <PolicySection number="06" title="Orders">
            <p>
              Placing an order on the website constitutes a request to purchase
              the selected products.
            </p>

            <p>
              An order is considered successfully confirmed only after payment
              has been successfully authorised and verified and the order has
              been accepted by 7BucksNutrition.
            </p>

            <p>
              We reserve the right to cancel or refuse an order where required
              because of product unavailability, suspected fraud, payment
              issues, incorrect pricing, technical errors or other legitimate
              reasons.
            </p>
          </PolicySection>

          <PolicySection number="07" title="Payments">
            <p>
              Online payments may be processed through Razorpay or another
              authorised payment service provider.
            </p>

            <p>
              Payment confirmation is subject to successful authorisation and
              verification by the applicable payment provider and
              7BucksNutrition.
            </p>

            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#f7f3eb] px-4 py-3.5">
              <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-[#9a753e]" />

              <p className="text-xs leading-5 text-black/65">
                7BucksNutrition does not request or store your UPI PIN, card
                CVV or full card credentials.
              </p>
            </div>
          </PolicySection>

          <PolicySection number="08" title="Shipping and Delivery">
            <p>
              Orders are dispatched to the delivery address provided during
              checkout.
            </p>

            <p>
              Delivery timelines may vary depending on destination, courier
              availability, operational conditions, public holidays, weather
              and other circumstances outside our reasonable control.
            </p>

            <p>
              Customers are responsible for providing a complete and accurate
              delivery address, PIN code and reachable contact number.
            </p>
          </PolicySection>

          <PolicySection number="09" title="Cancellation, Returns and Refunds">
            <p>
              Order cancellation, returns, replacements and refunds are governed
              by our Cancellation and Refund Policy.
            </p>

            <p>
              That policy forms an integral part of these Terms &amp;
              Conditions.
            </p>

            <a
              href="/cancellation-and-refund"
              className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#9a753e] underline decoration-[#9a753e]/25 underline-offset-4 transition-colors hover:text-black"
            >
              View Cancellation &amp; Refund Policy
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </PolicySection>

          <PolicySection number="10" title="Customer Accounts">
            <p>
              Customers are responsible for providing accurate information
              during registration, checkout and account management.
            </p>

            <p>
              Customers must keep their OTPs, passwords and account
              authentication information confidential.
            </p>

            <p>
              You must not share authentication codes or payment
              authentication information with anyone claiming to represent
              7BucksNutrition.
            </p>
          </PolicySection>

          <PolicySection number="11" title="Prohibited Activities">
            <p>
              You must not use the website for unlawful purposes or attempt to
              interfere with the security, functionality or operation of the
              website.
            </p>

            <p>
              You must not attempt to access another customer&apos;s account,
              personal information, orders or payment information.
            </p>

            <p>
              Fraudulent orders, fraudulent payment activity, abuse of
              promotional offers, automated attacks and other misuse of the
              website are prohibited.
            </p>
          </PolicySection>

          <PolicySection number="12" title="Intellectual Property">
            <p>
              Website content, branding, logos, graphics, text, designs,
              software and other materials belonging to 7BucksNutrition or its
              licensors are protected by applicable intellectual property laws.
            </p>

            <p>
              You may not reproduce, copy, distribute or commercially exploit
              such material without appropriate permission, except where
              permitted by law.
            </p>
          </PolicySection>

          <PolicySection number="13" title="Customer Support and Complaints">
            <p>
              If you have a question, complaint or issue with an order, please
              contact us first so that we can review the matter and attempt to
              resolve it.
            </p>

            <div className="mt-5 rounded-2xl border border-black/[0.08] bg-[#faf9f6] p-4 sm:p-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1e7d6]">
                    <MessageCircle className="h-4 w-4 text-[#9a753e]" />
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-black">
                      Need help?
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

          <PolicySection number="14" title="Changes to These Terms">
            <p>
              We may update these Terms &amp; Conditions when our services,
              products, payment arrangements or applicable legal requirements
              change.
            </p>

            <p>
              The latest version will be published on this page with an updated
              date.
            </p>
          </PolicySection>

          <PolicySection number="15" title="Governing Law">
            <p>
              These Terms &amp; Conditions are governed by the laws applicable
              in India.
            </p>

            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#f7f3eb] px-4 py-3.5">
              <Gavel className="mt-0.5 h-4 w-4 shrink-0 text-[#9a753e]" />

              <p className="text-xs leading-5 text-black/65">
                Any dispute shall be handled in accordance with applicable law
                and the jurisdiction of the competent courts having authority
                over the matter.
              </p>
            </div>
          </PolicySection>

          <PolicySection number="16" title="Contact Information">
            <div className="rounded-2xl border border-black/[0.08] bg-[#faf9f6] p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1e7d6]">
                  <UserRound className="h-4 w-4 text-[#9a753e]" />
                </span>

                <div className="text-sm leading-6.5 text-black/60">
                  <p className="font-semibold text-black">7BucksNutrition</p>

                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="mt-1 block transition-colors hover:text-[#9a753e]"
                  >
                    {SUPPORT_EMAIL}
                  </a>

                  <div className="mt-1">
                    <SupportPhone />
                  </div>

                  <p className="mt-1">
                    Sector 15, Faridabad, Haryana, India
                  </p>
                </div>
              </div>
            </div>
          </PolicySection>

          <div className="border-t border-black/[0.08] py-6">
            <div className="flex flex-col gap-3 text-xs text-black/40 sm:flex-row sm:items-center sm:justify-between">
              <span>7BucksNutrition · Terms &amp; Conditions</span>

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