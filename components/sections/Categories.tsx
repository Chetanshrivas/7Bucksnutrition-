"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type Category = {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

function normalizeImageUrl(
  imageUrl: string | null | undefined
): string | null {
  if (!imageUrl) return null;

  const value = imageUrl.trim();

  if (!value) return null;

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("//") ||
    value.startsWith("/")
  ) {
    return value;
  }

  return `/${value}`;
}

function getCategoryImage(
  category: Category,
  allCategories: Category[]
): string | null {
  const ownImage = normalizeImageUrl(category.image_url);

  if (ownImage) return ownImage;

  const children = allCategories
    .filter(
      (child) =>
        child.parent_id === category.id &&
        child.is_active
    )
    .sort((a, b) => {
      if (a.sort_order !== b.sort_order) {
        return a.sort_order - b.sort_order;
      }

      return (
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime()
      );
    });

  for (const child of children) {
    const childImage = normalizeImageUrl(
      child.image_url
    );

    if (childImage) return childImage;
  }

  return null;
}

function ArrowIcon({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function SparkIcon({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2.5c.5 4.6 2.9 7 7.5 9.5-4.6 2.5-7 4.9-7.5 9.5-.5-4.6-2.9-7-7.5-9.5C9.1 9.5 11.5 7.1 12 2.5Z" />
    </svg>
  );
}

function ProductImage({
  category,
  imageUrl,
  priority,
}: {
  category: Category;
  imageUrl: string | null;
  priority: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!imageUrl || failed) {
    return (
      <div className="absolute inset-0 flex items-center justify-center px-5 text-center">
        <span className="font-serif text-2xl font-bold italic text-[#2c2119]/15">
          {category.name}
        </span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={category.name}
      draggable={false}
      loading={priority ? "eager" : "lazy"}
      onError={() => setFailed(true)}
      className="absolute inset-0 h-full w-full bg-white object-contain p-1 transition-transform duration-700 ease-out group-hover:scale-[1.04] sm:p-1.5"
    />
  );
}

function SectionHeading() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center gap-4">
        <span className="h-px w-10 bg-[#b59058]" />

        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#966b3c]">
          Shop by category
        </p>
 
        <span className="h-px w-10 bg-[#b59058]" />
      </div>

      <h2 className="mt-1 font-serif text-2xl font-normal italic leading-[1.05] tracking-[-0.035em] text-[#261d17] sm:text-[3.8rem] lg:text-[4.4rem]">
        Select your 
        <span className=" text-[#b59058]"> fuel.</span>
      </h2>

      <p className="mt-1 max-w-xl text-[12px] font-normal leading-6 text-[#261d17]/55 sm:text-xs">
        Six focused collections. Choose the nutrition
        that fits your routine.
      </p>
    </div>
  );
}

const SECTION_BG =
  "radial-gradient(60% 50% at 50% 0%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%), radial-gradient(45% 40% at 100% 100%, rgba(214,178,132,0.35) 0%, rgba(214,178,132,0) 70%), linear-gradient(135deg, #fbf8f2 0%, #f5efe6 58%, #ecdcc9 100%)";

const CARD_SHADOW =
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(67,46,29,0.05),0_14px_30px_-20px_rgba(67,46,29,0.35)]";

const CARD_HOVER_SHADOW =
  "hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2px_4px_rgba(67,46,29,0.06),0_30px_50px_-24px_rgba(67,46,29,0.35)]";

function SectionStyles() {
  return (
    <style>{`
      @keyframes catRise {
        from { opacity: 0; transform: translateY(18px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .cat-rise {
        opacity: 0;
        animation: catRise 700ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }
      @media (prefers-reduced-motion: reduce) {
        .cat-rise { opacity: 1; animation: none; }
      }
    `}</style>
  );
}

function LoadingState() {
  return (
    <section
      className="relative overflow-hidden py-12 sm:py-14 lg:py-16"
      style={{ background: SECTION_BG }}
    >
      <div className="mx-auto w-full px-4 sm:px-7 lg:px-8">
        <SectionHeading />

        <div className="mx-auto mt-8 grid max-w-[1500px] grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className={`rounded-[22px] border border-[#2b211a]/[0.08] bg-[#fbf8f2] p-2 ${CARD_SHADOW}`}
            >
              <div className="aspect-[1/1.05] animate-pulse rounded-[16px] bg-[#ece3d7]" />

              <div className="mx-auto mt-4 h-4 w-2/3 animate-pulse rounded bg-[#e5dccf]" />

              <div className="mx-auto mb-3 mt-2.5 h-2 w-1/3 animate-pulse rounded bg-[#e5dccf]/70" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Categories() {
  const [allCategories, setAllCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      setLoading(true);
      setLoadError(false);

      const { data, error } =
        await supabase
          .from("categories")
          .select(
            `
              id,
              parent_id,
              name,
              slug,
              description,
              image_url,
              is_featured,
              is_active,
              sort_order,
              created_at,
              updated_at
            `
          )
          .eq("is_active", true)
          .order("sort_order", {
            ascending: true,
          })
          .order("created_at", {
            ascending: true,
          });

      if (!mounted) return;

      if (error) {
        console.error(
          "Categories loading error:",
          error
        );

        setAllCategories([]);
        setLoadError(true);
        setLoading(false);
        return;
      }

      setAllCategories(
        (data ?? []) as Category[]
      );

      setLoading(false);
    }

    void loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(
    () =>
      allCategories.filter(
        (category) =>
          category.parent_id === null
      ),
    [allCategories]
  );

  const categoryImages = useMemo(() => {
    const imageMap = new Map<
      string,
      string | null
    >();

    categories.forEach((category) => {
      imageMap.set(
        category.id,
        getCategoryImage(
          category,
          allCategories
        )
      );
    });

    return imageMap;
  }, [categories, allCategories]);

  if (loading) {
    return <LoadingState />;
  }

  if (categories.length === 0) {
    return (
      <section className="bg-[#f7f2ea] px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-[1500px]">
          <SectionHeading />

          <div className="mt-8 border-y border-[#2b211a]/10 py-9 text-center sm:mt-10">
            <p className="font-serif text-xl font-bold text-[#261d17] sm:text-2xl">
              {loadError
                ? "Categories could not load."
                : "Your collection is coming soon."}
            </p>

            <p className="mt-2 text-xs font-medium text-[#261d17]/50 sm:text-sm">
              {loadError
                ? "Please refresh the page and try once more."
                : "No main categories are available right now."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative isolate overflow-hidden py-12 sm:py-14 lg:py-16"
      style={{ background: SECTION_BG }}
    >
      <SectionStyles />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#9c6f3d]/40 to-transparent"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#9c6f3d]/25 to-transparent"
      />

      <div className="relative mx-auto w-full px-4 sm:px-7 lg:px-8">
        <SectionHeading />

        <div className="mx-auto mt-8 max-w-[1500px] sm:mt-10 lg:mt-11">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {categories.map(
              (category, index) => {
                const imageUrl =
                  categoryImages.get(
                    category.id
                  ) ?? null;

                const warmPanel =
                  index % 2 === 1;

                const description =
                  category.description?.trim();

                return (
                  <Link
                    key={category.id}
                    href={`/shop?category=${encodeURIComponent(
                      category.slug
                    )}`}
                    aria-label={`Shop ${category.name}`}
                    style={{
                      animationDelay: `${index * 80}ms`,
                    }}
                    className={`cat-rise group relative flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-[#2b211a]/[0.08] p-[7px] transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-[#b48b56]/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b48b56] sm:rounded-[26px] sm:p-2 ${CARD_SHADOW} ${CARD_HOVER_SHADOW} ${
                      warmPanel
                        ? "bg-gradient-to-b from-[#f7f0e6] to-[#f1e7d8]"
                        : "bg-gradient-to-b from-[#fdfbf6] to-[#f8f2e9]"
                    }`}
                  >
                    <div className="relative aspect-[1/1.05] overflow-hidden rounded-[16px] bg-white sm:rounded-[20px]">
                      <ProductImage
                        category={category}
                        imageUrl={imageUrl}
                        priority={index < 3}
                      />

                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent transition-transform duration-[1100ms] ease-out group-hover:translate-x-[320%]"
                      />

                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-[16px] ring-1 ring-inset ring-[#2b211a]/[0.06] sm:rounded-[20px]"
                      />

                      <span className="absolute left-2.5 top-2.5 flex h-6 min-w-6 items-center justify-center rounded-full border border-[#2b211a]/10 bg-[#fbf8f2]/85 px-1.5 font-serif text-[9px] font-bold italic text-[#9e7442] backdrop-blur sm:left-3 sm:top-3 sm:h-7 sm:min-w-7">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      {category.is_featured && (
                        <span className="absolute right-2.5 top-2.5 flex h-6 items-center gap-1 rounded-full bg-[#261d17] px-2 text-[#e9c48f] shadow-sm sm:right-3 sm:top-3 sm:h-7 sm:px-2.5">
                          <SparkIcon className="h-2.5 w-2.5" />

                          <span className="hidden text-[8px] font-bold tracking-[0.14em] sm:inline">
                            Featured
                          </span>
                        </span>
                      )}

                      <span className="absolute bottom-2.5 right-2.5 flex h-8 w-8 translate-y-0 items-center justify-center rounded-full border border-[#2b211a]/10 bg-[#fbf8f2]/90 text-[#261d17] shadow-sm backdrop-blur transition-all duration-500 group-hover:border-[#261d17] group-hover:bg-[#261d17] group-hover:text-[#f1d5a8] sm:bottom-3 sm:right-3 sm:h-9 sm:w-9 sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                        <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </span>
                    </div>

                    <div className="flex min-h-[56px] flex-col items-center justify-center px-1.5 pb-2 pt-3 text-center sm:min-h-[70px]">
                      <h3 className="font-serif text-lg font-semibold italic uppercase leading-tight tracking-[0.01em] text-[#261d17] transition-colors duration-300 group-hover:text-[#ad814a] sm:text-xl">
                        {category.name}
                      </h3>

                      {description ? (
                        <p className="mt-1 hidden line-clamp-1 max-w-full text-[10px] font-medium leading-4 text-[#261d17]/45 sm:block">
                          {description}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                );
              }
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-center sm:mt-10">
          <Link
            href="/categories"
            className="group inline-flex h-11 items-center justify-center gap-2.5 rounded-full border border-[#261d17]/20 bg-[#fbf8f2]/70 px-6 text-[8px] font-bold uppercase tracking-[0.22em] text-[#261d17]/75 shadow-[0_8px_20px_-14px_rgba(67,46,29,0.4)] backdrop-blur transition-all duration-500 hover:border-[#261d17] hover:bg-[#261d17] hover:text-[#f1d5a8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b48b56]"
          >
            View all categories

            <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Categories;