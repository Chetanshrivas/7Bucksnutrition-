import type { Metadata } from "next";
import {
  ArrowUpRight,
  Database,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  UserRound,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | 7BucksNutrition",
  description:
    "Privacy Policy for 7BucksNutrition.",
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

export default function PrivacyPolicyPage() {
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
            <h1 className="whitespace-nowrap font-serif text-[clamp(1.9rem,6vw,4.5rem)] leading-none tracking-[-0.045em]">
              <span className="text-white">Privacy</span>{" "}
              <span className="italic text-[#e5ce9e]">Policy</span>
            </h1>

            <p className="mt-5 max-w-2xl text-[13px] leading-6 text-white/55 sm:mt-6 sm:text-[15px] sm:leading-7">
              How we collect, use and protect information when you browse our
              website, create an account, place an order or contact us.
            </p>
          </div>
        </div>
      </section>

      {/* Quick information */}
      <section className="border-b border-black/[0.08] bg-white">
        <div className="mx-auto grid max-w-6xl sm:grid-cols-3">
          <div className="flex items-center gap-3 border-b border-black/[0.08] px-5 py-5 sm:border-b-0 sm:border-r sm:px-7 lg:px-10">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5efe5]">
              <ShieldCheck className="h-4 w-4 text-[#9a753e]" />
            </span>

            <div>
              <p className="text-xs font-semibold text-black">
                Your information matters
              </p>

              <p className="mt-0.5 text-[11px] text-black/45">
                Used only for genuine business needs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-b border-black/[0.08] px-5 py-5 sm:border-b-0 sm:border-r sm:px-7 lg:px-10">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5efe5]">
              <LockKeyhole className="h-4 w-4 text-[#9a753e]" />
            </span>

            <div>
              <p className="text-xs font-semibold text-black">
                Payment credentials
              </p>

              <p className="mt-0.5 text-[11px] text-black/45">
                Sensitive payment details are not stored
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-5 py-5 sm:px-7 lg:px-10">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f5efe5]">
              <UserRound className="h-4 w-4 text-[#9a753e]" />
            </span>

            <div>
              <p className="text-xs font-semibold text-black">
                Customer control
              </p>

              <p className="mt-0.5 text-[11px] text-black/45">
                Contact us about your information
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Policy content */}
      <section className="px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[26px] bg-white px-5 shadow-[0_20px_70px_-45px_rgba(0,0,0,0.35)] sm:px-8 lg:px-12">
          <PolicySection number="01" title="Who We Are">
            <p>
              7BucksNutrition operates an online sports nutrition and supplement
              store serving customers in India.
            </p>

            <p>
              In this policy, “we”, “us” and “our” refer to 7BucksNutrition.
            </p>
          </PolicySection>

          <PolicySection number="02" title="Information We Collect">
            <p>
              Depending on how you use our website, we may collect your name,
              mobile number, email address, delivery and billing address, order
              details, account information and information you voluntarily
              provide when contacting us.
            </p>

            <p>
              We may also collect basic technical information such as your IP
              address, browser or device information, pages visited and
              diagnostic information needed to operate and secure the website.
            </p>
          </PolicySection>

          <PolicySection number="03" title="How We Use Your Information">
            <p>
              We use customer information to create and manage accounts,
              process and deliver orders, process payments, provide support,
              send order and service communications, maintain website security,
              prevent misuse and improve our services.
            </p>

            <p>
              Information may also be used where necessary to meet applicable
              legal or regulatory requirements.
            </p>
          </PolicySection>

          <PolicySection number="04" title="Payments">
            <p>
              Online payments may be processed through Razorpay or another
              authorised payment service provider.
            </p>

            <p>
              We do not request or store your UPI PIN, card CVV or full card
              credentials. Payment providers process transaction information
              according to their own terms and privacy notices.
            </p>

            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#f7f3eb] px-4 py-3.5">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[#9a753e]" />

              <p className="text-xs leading-5 text-black/60">
                Sensitive payment authentication information should never be
                shared with anyone claiming to represent 7BucksNutrition.
              </p>
            </div>
          </PolicySection>

          <PolicySection number="05" title="How Information May Be Shared">
            <p>
              We may share information that is reasonably required with
              service providers involved in payment processing, order
              fulfilment, shipping, communications, website infrastructure,
              fraud prevention and customer support.
            </p>

            <p>
              Information may also be disclosed where required by law,
              regulation, court order or a lawful government request.
            </p>

            <p>
              We do not sell customer personal information as a standalone
              commercial product.
            </p>
          </PolicySection>

          <PolicySection number="06" title="Data Security">
            <p>
              We use reasonable technical and organisational safeguards
              intended to protect customer information from unauthorised
              access, alteration, disclosure or destruction.
            </p>

            <p>
              While we take reasonable steps to protect information, no
              internet-based system can be guaranteed to be completely secure.
            </p>
          </PolicySection>

          <PolicySection number="07" title="Account and Order Information">
            <p>
              Please keep your account credentials and OTPs confidential.
            </p>

            <p>
              7BucksNutrition will not ask you to share an OTP, password or
              payment authentication information with someone claiming to
              represent us.
            </p>
          </PolicySection>

          <PolicySection number="08" title="Cookies and Website Technologies">
            <p>
              We may use essential cookies or similar technologies required for
              authentication, cart functionality, security and normal website
              operation.
            </p>

            <p>
              Where non-essential analytics or similar technologies are used,
              they may be subject to the applicable settings and disclosures
              provided on the website.
            </p>
          </PolicySection>

          <PolicySection number="09" title="Data Retention">
            <p>
              We retain personal information for as long as reasonably
              necessary to provide our services, maintain transaction and
              accounting records, resolve disputes, prevent fraud and comply
              with applicable legal obligations.
            </p>
          </PolicySection>

          <PolicySection number="10" title="Your Requests">
            <p>
              You may contact us to request access to, correction of, or
              clarification about personal information associated with your
              account, subject to applicable law and reasonable verification
              requirements.
            </p>
          </PolicySection>

          <PolicySection number="11" title="Children">
            <p>
              Our services are intended for adults and purchasers who can
              legally enter into transactions.
            </p>

            <p>
              We do not knowingly collect personal information from children
              for independent purchasing purposes.
            </p>
          </PolicySection>

          <PolicySection number="12" title="Changes to This Policy">
            <p>
              We may update this Privacy Policy when our services, legal
              obligations or data practices change.
            </p>

            <p>
              The latest version will be published on this page with a revised
              update date.
            </p>
          </PolicySection>

          <PolicySection number="13" title="Contact Us">
            <div className="rounded-2xl border border-black/[0.08] bg-[#faf9f6] p-4 sm:p-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1e7d6]">
                    <MessageCircle className="h-4 w-4 text-[#9a753e]" />
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-black">
                      Privacy-related questions
                    </p>

                    <p className="mt-1 text-xs leading-5 text-black/50">
                      Contact us if you have a question about your information.
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