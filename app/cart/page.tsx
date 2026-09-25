"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { useCart } from "../../components/cart/CartProvider";
import { useAuth } from "../../components/auth/AuthProvider";
import { toast } from "sonner";

const FREE_SHIP = 5000;

function TrashIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}
function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
  );
}
function ShieldIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4Z" /><path d="m9 12 2 2 4-4" /></svg>
  );
}
function TruckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 16V6h11v10" /><path d="M14 9h4l3 3v4h-7" /><circle cx="7.5" cy="17.5" r="1.8" /><circle cx="17.5" cy="17.5" r="1.8" /></svg>
  );
}
function BagIcon({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
  );
}
function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-border bg-ivory px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.06em] text-espresso/55">{children}</span>;
}
function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-espresso/50">{label}</span>
      <span className={`text-sm font-semibold tabular-nums ${accent ? "text-clay" : "text-espresso"}`}>{value}</span>
    </div>
  );
}
function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center justify-center gap-1.5 rounded-xl border border-border bg-ivory px-2 py-2 text-[8px] font-bold uppercase tracking-[0.12em] text-espresso/45">
      <span className="text-clay">{icon}</span>
      {text}
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items, cartCount, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  const formatPrice = (value: number) => `₹${value.toLocaleString("en-IN")}`;

  const savings = useMemo(
    () =>
      items.reduce(
        (s: number, i: any) =>
          s + (i.compareAt && i.compareAt > i.price ? (i.compareAt - i.price) * i.quantity : 0),
        0
      ),
    [items]
  );

  const shipProgress = Math.min(100, Math.round((subtotal / FREE_SHIP) * 100));
  const remaining = Math.max(0, FREE_SHIP - subtotal);

  const handleProceedToCheckout = () => {
    if (authLoading) {
      toast.error("Please wait while your account is loading.");
      return;
    }
    if (!user) {
      toast.error("Please login before proceeding to checkout.");
      router.push(`/login?redirect=${encodeURIComponent("/checkout")}`);
      return;
    }
    if (items.length === 0) {
      toast.error("Your bag is empty.");
      return;
    }
    router.push("/checkout");
  };

  if (items.length === 0) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-ivory text-espresso">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(900px 520px at 50% -10%, rgba(201,162,75,0.18), transparent 70%)" }}
        />
        <section className="relative mx-auto flex min-h-[86vh] max-w-[900px] flex-col items-center justify-center px-5 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex h-24 w-24 items-center justify-center rounded-full border border-clay/30 bg-white/70 text-clay shadow-[0_24px_60px_-30px_rgba(36,26,20,0.45)] backdrop-blur"
          >
            <span className="absolute inset-0 rounded-full bg-clay/15 blur-xl" />
            <BagIcon />
          </motion.div>

          <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-3 py-1.5 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-clay" />
            <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-clay">Seven Bucks Nutrition</span>
          </div>

          <h1 className="mt-5 font-serif text-5xl leading-none tracking-[-0.04em] sm:text-6xl">
            Your <span className="italic text-clay">bag is empty.</span>
          </h1>

          <p className="mt-5 max-w-md text-sm leading-7 text-espresso/50">
            Your selected supplements will appear here. Explore our collection and find something that fits your goals.
          </p>

          <Link
            href="/shop"
            className="group mt-9 inline-flex min-h-12 items-center gap-2 rounded-full bg-espresso px-8 text-[10px] font-bold uppercase tracking-[0.18em] text-ivory shadow-[0_18px_44px_-18px_rgba(36,26,20,0.75)] transition duration-300 hover:-translate-y-0.5 hover:bg-clay"
          >
            Explore Supplements
            <span className="transition-transform duration-300 group-hover:translate-x-1"><ArrowRight /></span>
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-ivory text-espresso">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px]"
        style={{
          background:
            "radial-gradient(900px 460px at 15% -10%, rgba(201,162,75,0.22), transparent 70%), radial-gradient(700px 420px at 95% 0%, rgba(36,26,20,0.10), transparent 70%)",
        }}
      />

      {/* Header */}
      <section className="relative px-5 pb-8 pt-28 sm:px-8 sm:pb-10 lg:px-12 lg:pb-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-6 flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-espresso/35">
            <Link href="/" className="transition hover:text-espresso">Home</Link>
            <span>/</span>
            <span className="text-espresso/65">Your Bag</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
          >
            <div className="flex items-start gap-4">
              <span className="mt-1 hidden h-16 w-px shrink-0 bg-gradient-to-b from-clay to-transparent sm:block" />
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-3 py-1.5 backdrop-blur">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-clay/70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-clay" />
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.28em] text-clay">Seven Bucks Nutrition</span>
                </div>

                <h1 className="font-serif text-5xl leading-[0.9] tracking-[-0.05em] sm:text-6xl lg:text-7xl">
                  Your{" "}
                  <span className="bg-gradient-to-br from-[#c9a24b] via-[#e3c985] to-[#9a7b3f] bg-clip-text italic text-transparent">Bag</span>
                </h1>

                <p className="mt-3 text-sm text-espresso/45">
                  {cartCount} {cartCount === 1 ? "item" : "items"} selected
                  {savings > 0 && (
                    <span className="ml-2 rounded-full bg-clay/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-clay">
                      saving {formatPrice(savings)}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={clearCart}
              className="inline-flex h-10 w-fit items-center gap-2 rounded-full border border-border bg-white/70 px-4 text-[9px] font-bold uppercase tracking-[0.16em] text-espresso/45 backdrop-blur transition duration-300 hover:border-clay/50 hover:text-clay"
            >
              <TrashIcon />
              Clear Bag
            </button>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="relative border-t border-border/80 px-5 py-7 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        <div className="mx-auto grid max-w-[1440px] items-start gap-7 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10 xl:gap-14">
          <div>
            {/* Free shipping meter */}
            {/* <div className="mb-5 overflow-hidden rounded-2xl border border-border bg-white/70 p-4 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-espresso/55">
                  <span className="text-clay"><TruckIcon /></span>
                  {remaining > 0 ? (
                    <>{formatPrice(remaining)} away from <span className="text-clay">free shipping</span></>
                  ) : (
                    <span className="text-clay">Free shipping unlocked</span>
                  )}
                </span>
                <span className="text-[10px] font-bold text-clay">{shipProgress}%</span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-espresso/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${shipProgress}%` }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-[#9a7b3f] via-[#c9a24b] to-[#e3c985]"
                />
              </div>
            </div> */}

            <div className="mb-3 flex items-center justify-between">
              <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-espresso/35">Selected Items</p>
              <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-clay">
                {items.length} {items.length === 1 ? "Product" : "Products"}
              </span>
            </div>

            <div className="space-y-3.5">
              {items.map((item: any, idx: number) => {
                const itemTotal = item.price * item.quantity;
                const discount =
                  item.compareAt && item.compareAt > item.price
                    ? Math.round(((item.compareAt - item.price) / item.compareAt) * 100)
                    : null;
                const hasVariantDetails =
                  Boolean(item.isVariant) && Boolean(item.flavor || item.size || item.servings);

                return (
                  <motion.article
                    key={item.variantId}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
                    className="group relative overflow-hidden rounded-[26px] border border-border bg-gradient-to-b from-white to-card transition-all duration-500 hover:-translate-y-0.5 hover:border-clay/40 hover:shadow-[0_28px_60px_-34px_rgba(36,26,20,0.5)]"
                  >
                    <span className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-clay/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                    <div className="flex gap-4 p-3.5 sm:gap-5 sm:p-4">
                      <div className="relative h-[104px] w-[104px] shrink-0 overflow-hidden rounded-2xl border border-border bg-white sm:h-36 sm:w-36">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.flavor ? `${item.productName} ${item.flavor}` : item.productName}
                            className="h-full w-full object-contain p-1.5 transition duration-700 group-hover:scale-[1.06]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-white">
                            <span className="px-3 text-center font-serif text-sm italic text-espresso/25">{item.brand}</span>
                          </div>
                        )}

                        {discount !== null && discount > 0 && (
                          <span className="absolute left-1.5 top-1.5 rounded-full bg-espresso/85 px-2 py-1 text-[7px] font-bold uppercase tracking-wide text-[#e3c985] backdrop-blur">
                            {discount}% off
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-clay sm:text-[9px]">{item.brand}</p>
                            <h2 className="mt-1 text-sm font-semibold leading-snug tracking-[-0.01em] text-espresso sm:text-lg">{item.productName}</h2>

                            {hasVariantDetails && (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {item.flavor && <Chip>{item.flavor}</Chip>}
                                {item.size && <Chip>{item.size}</Chip>}
                                {item.servings && <Chip>{item.servings} Servings</Chip>}
                              </div>
                            )}

                            {item.stock <= 5 && (
                              <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#b4551f]">Only {item.stock} left</p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.variantId)}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-transparent text-espresso/25 transition duration-300 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            aria-label={`Remove ${item.productName} from bag`}
                          >
                            <TrashIcon />
                          </button>
                        </div>

                        <div className="mt-4 flex items-end justify-between gap-3 sm:mt-6">
                          <div>
                            <p className="mb-1.5 text-[7px] font-bold uppercase tracking-[0.16em] text-espresso/30">Quantity</p>
                            <div className="flex h-10 items-center rounded-full border border-border bg-ivory shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="flex h-full w-9 items-center justify-center rounded-full text-base text-espresso/50 transition hover:bg-white hover:text-espresso disabled:cursor-not-allowed disabled:opacity-20"
                                aria-label={`Decrease quantity of ${item.productName}`}
                              >
                                −
                              </button>
                              <span className="w-8 text-center text-xs font-bold tabular-nums">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                                disabled={item.quantity >= item.stock}
                                className="flex h-full w-9 items-center justify-center rounded-full text-base text-espresso/50 transition hover:bg-white hover:text-espresso disabled:cursor-not-allowed disabled:opacity-20"
                                aria-label={`Increase quantity of ${item.productName}`}
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-base font-bold tracking-tight tabular-nums text-espresso sm:text-2xl">{formatPrice(itemTotal)}</p>
                            {item.quantity > 1 && (
                              <p className="mt-0.5 text-[9px] text-espresso/35">{formatPrice(item.price)} each</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>

            <Link
              href="/shop"
              className="group mt-6 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-espresso/45 transition hover:text-clay"
            >
              <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
              Continue Shopping
            </Link>
          </div>

          {/* Summary */}
          <aside className="relative h-fit overflow-hidden rounded-[28px] border border-border bg-gradient-to-b from-white to-card p-5 shadow-[0_30px_70px_-45px_rgba(36,26,20,0.6)] sm:p-6 lg:sticky lg:top-28">
            <span className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-clay/60 to-transparent" />

            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-clay">Order Summary</p>
              <span className="h-1.5 w-1.5 rounded-full bg-clay" />
            </div>

            <div className="mt-6 space-y-4 border-b border-dashed border-border pb-5">
              <Row label="Subtotal" value={formatPrice(subtotal)} />
              <Row label="Items" value={String(cartCount)} />
              {savings > 0 && <Row label="You save" value={`− ${formatPrice(savings)}`} accent />}
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm text-espresso/50">Shipping</span>
                <span className="max-w-[150px] text-right text-[8px] font-bold uppercase leading-4 tracking-[0.08em] text-clay">
                  Calculated at checkout
                </span>
              </div>
            </div>

            <div className="flex items-end justify-between gap-4 pt-5">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-espresso/35">Total</p>
                <p className="mt-1 font-serif text-3xl italic tracking-[-0.04em] tabular-nums sm:text-4xl">{formatPrice(subtotal)}</p>
              </div>
              <span className="pb-1 text-[8px] font-semibold uppercase tracking-[0.18em] text-espresso/30">INR</span>
            </div>

            <button
              type="button"
              onClick={handleProceedToCheckout}
              disabled={authLoading}
              className="group relative mt-6 flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-espresso px-5 text-[10px] font-bold uppercase tracking-[0.2em] text-ivory shadow-[0_20px_44px_-20px_rgba(36,26,20,0.85)] transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#9a7b3f] via-[#c9a24b] to-[#9a7b3f] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="absolute -left-full top-0 h-full w-1/2 skew-x-[-20deg] bg-white/25 transition-all duration-700 group-hover:left-[130%]" />
              <span className="relative">
                {authLoading ? "Checking Account..." : user ? "Proceed to Checkout" : "Login to Checkout"}
              </span>
              {!authLoading && (
                <span className="relative transition-transform duration-300 group-hover:translate-x-1"><ArrowRight /></span>
              )}
            </button>

            <Link
              href="/shop"
              className="mt-2.5 flex h-11 w-full items-center justify-center rounded-full border border-border bg-ivory text-[9px] font-bold uppercase tracking-[0.18em] text-espresso/50 transition duration-300 hover:border-espresso/20 hover:text-espresso"
            >
              Continue Shopping
            </Link>

            <div className="mt-5 grid grid-cols-2 gap-2 border-t border-border pt-4">
              <Badge icon={<ShieldIcon size={13} />} text="100% Authentic" />
              <Badge icon={<TruckIcon />} text="Fast Dispatch" />
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-espresso/30">
              <ShieldIcon />
              <p className="text-center text-[8px] leading-4">Secure checkout · Trusted nutrition · Faridabad</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
