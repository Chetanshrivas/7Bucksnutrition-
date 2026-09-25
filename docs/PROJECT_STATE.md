# Seven Bucks Nutrition — PROJECT STATE (Handoff Doc)

**Read this first, before touching any code.** This is a continuation of an ongoing build.
The owner (Chetan) works in Hinglish, casual tone. He copy-pastes files manually or uses
zips — always give him a working zip, not just inline snippets, and confirm structure.

---

## 1. What this project is

Seven Bucks Nutrition — premium sports-nutrition e-commerce brand, physical store in
Sector 15, Faridabad, Haryana, India. Full storefront + admin, built to production quality,
not a demo. Owner previously built a similar-scale project (AILURA, a salon e-commerce site)
with a similar stack, so he's familiar with this kind of build.

## 2. Locked stack decisions — DO NOT change without strong reason

- **Next.js 15.5.9** (App Router) — NOT 14.x. Next 14 is EOL (Oct 2025) with unpatched CVEs,
  upgraded deliberately from the original brief's implied "any Next.js" to 15.5.9.
- **React 19.0.3** (required by Next 15)
- **TypeScript**, strict mode
- **Tailwind CSS 3.4.7** — explicitly NOT v4. Standard `@tailwind base/components/utilities`
  directives in `app/globals.css`. Do not introduce `@tailwindcss/postcss`.
- **NEVER use `@/` import aliases.** Use relative imports (`../`, `../../`). This is a hard
  rule from the owner, not a suggestion. `tsconfig.json` has no `paths` config — keep it that
  way.
- Supabase/PostgreSQL (not yet wired — schema not started)
- Cloudinary for product media (not yet wired)
- Sonner for toasts (already in `app/layout.tsx`)
- GSAP — selective use only, for meaningful scroll-reveal animation, not decoration
- Razorpay for payments (not yet wired)
- Resend for transactional email (not yet wired) — owner has built this exact pattern before
  on AILURA (order confirmations, appointment confirmations, admin notifications) and may
  want to reuse that approach
- Vercel for deployment
- Server Components by default; Client Components only where interactivity is required
- Performance and SEO are hard requirements from day one, not an afterthought phase

## 3. Design DNA — extracted from owner's own Lovable prototype (reference only, not code)

The owner uploaded two Lovable-exported zips (`seven-bucks-nutrition.zip` /
`seven-bucks-nutrition__1_.zip`) built with TanStack Start + Tailwind v4 + shadcn/ui. That
stack is NOT what we're using — it was studied only for visual/UX direction, per the
project's own instruction: "use the supplied reference ZIP as a deep design/UX reference,
but improve on it rather than copy it."

**Palette (converted from the reference's oklch tokens to hex for Tailwind 3.x):**
- `ivory` — `#F8F5EF` (background)
- `espresso` — `#2B1F17` (dark brown, primary/text, hero backgrounds)
- `clay` — `#B65C2E` (terracotta accent — links, eyebrows, hover states)
- `gold` — `#C9A667` (highlight accent, italic word treatment)
- `sand` — `#E7DBC5` (secondary/muted surfaces)

All wired into `tailwind.config.ts` as both named colors (`ivory`, `espresso`, etc.) and
semantic tokens (`background`, `foreground`, `primary`, `card`, `border`, etc.) — use the
semantic tokens for structural UI, named colors for deliberate brand moments (hero, CTA).

**Typography:**
- Display/serif accent: **Instrument Serif** (italic used for single-word emphasis inside
  headlines, e.g. "100% genuine. *Every* scoop.") — loaded via `next/font/google` in
  `app/layout.tsx` as `--font-instrument-serif`, mapped to Tailwind's `font-serif`.
- Body/sans: **Plus Jakarta Sans**, weights 400–800 — loaded as `--font-plus-jakarta`, mapped
  to `font-sans` (the default body font).
- Do NOT switch fonts without checking with the owner — this is a deliberate brand choice
  pulled from his own reference.

**Brand voice / copy tone (from the reference, keep this energy):**
Trust-and-authenticity-led. The core anxiety in Indian sports-nutrition retail is fake/
counterfeit product, so copy leans hard into "hologram verified," "authorised stockist,"
"GST billed," "lab-tested," "fully disclosed labels," "no proprietary blends," specific
clinical doses (e.g. "6g citrulline, 5g creatine, 3.2g beta-alanine"). Register is confident,
specific, slightly editorial — not generic e-commerce copy. Reuse this tone when writing new
sections (About, product descriptions, FAQ).

**Homepage section order (from reference, matches PROJECT_MEMORY.md too):**
Navbar → cinematic hero (full-bleed video/image, scroll-scrub parallax, eyebrow + huge
display headline with italic word) → trust marquee strip → "standard" pillars (tested /
dosed / nothing hidden) → categories → featured products → "how an order runs" steps →
split brand-story section → reviews → FAQ → CTA → footer.

**Interaction pattern:** `data-reveal` / scroll-triggered GSAP fade-up on most sections,
subtle parallax on hero media, wave-divider SVG under hero. Keep this pattern but implement
fresh (do not copy the reference's GSAP hook code verbatim — write our own
`useGsapReveal`-equivalent when we get to that phase, respecting `prefers-reduced-motion`,
already stubbed via the `@media (prefers-reduced-motion: reduce)` block in `globals.css`).

## 4. What's actually built so far (verified working)

Root config:
- `package.json` — all deps decided, versions pinned (see file)
- `tsconfig.json` — strict, no path aliases
- `next.config.mjs` — Cloudinary remote image pattern whitelisted, avif/webp formats
- `tailwind.config.ts` — full palette + semantic tokens, `font-serif`/`font-sans` mapped,
  `shadow-lift` and `marquee` keyframe utilities added
- `postcss.config.js` — standard Tailwind 3 setup
- `.env.example` — all required env vars listed (Supabase, Cloudinary, Razorpay, Resend,
  admin session secret) — no real secrets, owner fills these in later
- `.gitignore` — standard Next.js

App:
- `app/layout.tsx` — root layout, both Google fonts wired via `next/font/google`, Sonner
  `<Toaster />` mounted, full SEO metadata block (title template, OG, Twitter card, robots).
  **Known placeholder:** `NEXT_PUBLIC_SITE_URL` fallback is `https://sevenbucksnutrition.com`
  — confirm actual domain with owner when available and update, or rely on the env var.
- `app/globals.css` — Tailwind directives, base layer (smooth scroll, selection color,
  focus-visible ring in clay), component layer utility classes (`.eyebrow`, `.display`,
  `.container-page`, `.surface-card`), reduced-motion media query.
- `app/page.tsx` — **placeholder only**, a single full-screen espresso section proving fonts
  + palette work. This is NOT the real homepage — Phase 05+ (homepage sections) will replace
  this entirely with the full section stack described in §3 above.

**Verified locally by Claude (sandboxed, no live font network access there):**
- `npm i` — clean install, zero peer-dependency conflicts (after upgrading to Next 15.5.9 +
  React 19.0.3, see §5)
- `npx tsc --noEmit` — zero TypeScript errors
- `npm run build` fails ONLY in Claude's sandbox because that sandbox cannot reach
  `fonts.googleapis.com`. This is not a real bug — confirmed by the clean typecheck. On the
  owner's machine (real internet) both `npm run dev` and `npm run build` work fine. The
  owner independently confirmed `npm run dev` works and the placeholder homepage renders
  correctly with fonts/colors.

**Owner-side issue encountered & resolved:** VS Code was using its own bundled TypeScript
(6.0.3) instead of the project's installed TypeScript (5.9.3 in `node_modules`), causing a
false-positive "Cannot find module './globals.css'" editor error. Fixed via
`TypeScript: Select TypeScript Version` → "Use Workspace Version." This was purely a VS Code
IntelliSense issue, never a real build/hosting problem — confirmed safe for Vercel deploy.

## 5. Deviations from the original brief — documented per instructions

- **Next.js version bumped from implied/unstated to 15.5.9** (React 19 accordingly).
  Reason: Next.js 14.x reached end-of-life Oct 2025 with multiple unpatched critical CVEs
  (middleware auth bypass, RCE via RSC, SSRF). Not safe for a production e-commerce app
  handling payments/customer data. Tailwind 3.x, no-`@/`-alias, and all other stack rules
  are unaffected and still honored.

## 6. What's NOT done yet — full remaining roadmap

Referencing `01_PROJECT_MEMORY/BUILD_ROADMAP.md` from the owner's original handoff pack:

- [x] 01 Foundation + Tailwind 3.x verification
- [ ] 02 Design system + typography (partially done — tokens exist in Tailwind config and
      globals.css component layer; still need a documented type scale / spacing scale and
      maybe a `components/ui/` primitives folder: Button, Badge, Container, SectionHeading)
- [ ] 03 Premium Navbar
- [ ] 04 Cinematic Hero
- [ ] 05 Trust/Brand strip
- [ ] 06 Categories
- [ ] 07 Featured products
- [ ] 08 Trusted brands
- [ ] 09 Reviews
- [ ] 10 About/store story
- [ ] 11 Store/contact
- [ ] 12 Footer
- [ ] 13 Shop/catalog
- [ ] 14 Search/filter/sort
- [ ] 15 Category pages
- [ ] 16 Brand pages
- [ ] 17 Product detail
- [ ] 18 Supabase schema/RLS
- [ ] 19 Catalog import/seed
- [ ] 20 Admin authentication
- [ ] 21 Admin dashboard
- [ ] 22 Product builder
- [ ] 23 Variant builder
- [ ] 24 Cloudinary media
- [ ] 25 Inventory
- [ ] 26 Cart
- [ ] 27 Checkout/payment
- [ ] 28 Orders
- [ ] 29 Shipping/tracking
- [ ] 30 Reviews/moderation
- [ ] 31 SEO/structured data
- [ ] 32 Performance audit
- [ ] 33 Security audit
- [ ] 34 Accessibility/mobile QA
- [ ] 35 Vercel deployment
- [ ] 36 Production verification

## 7. Data still needed from the owner (not yet provided)

Per the original `03_INPUT_DATA_TO_PROVIDE/DATA_CHECKLIST.md`:
- Seven Bucks Nutrition logo (SVG/PNG)
- Approved/licensed hero image or video (brief mentions an Arnold Schwarzenegger visual —
  **must be properly licensed**, do not source or use unlicensed celebrity imagery)
- Complete product catalog (CSV/Excel/JSON)
- Complete brand list (examples given: MuscleTech, MuscleBlaze, Labrada, Kevin Levrone,
  Beast Life, Ronnie Coleman, Dynamite, Avatar, GNC, BSN)
- Category/subcategory taxonomy
- Official domain name
- Business phone/email/hours/address, Google Business Profile, social links
- Shipping/courier providers, tracking URL patterns, shipping charges/zones
- Razorpay account + credentials (never pasted into chat — `.env.local` only)
- COD/cancellation/return/refund policies
- Admin roles needed

Do not block on all of these — foundation/design-system/navbar/hero-shell work can proceed
with placeholders, but flag clearly wherever a placeholder is used (e.g. placeholder logo
text instead of image, lorem-ish product data) so the owner knows what's temporary.

## 8. Working conventions with this owner

- Deliver in small batches (~5 files at a time) OR a full project zip — owner has explicitly
  said he can't easily do partial file replacement, so **prefer a full, fresh zip of the
  whole `seven-bucks-nutrition/` folder each time** (excluding `node_modules`, `.next`,
  `package-lock.json` — he regenerates those with `npm i`).
- Always verify with `npx tsc --noEmit` (and `npm run build` if network allows) before
  handing off a zip — this owner will not debug Claude's mistakes, expects it pre-verified.
- Explain fixes in Hinglish, casual, direct — no long lectures unless something is a genuine
  hard rule (security, data loss risk).
- When starting a new session from this file: read this whole doc, then ask the owner
  (briefly) whether to continue with the next unchecked roadmap item (§6) or something else
  — don't assume silently.
