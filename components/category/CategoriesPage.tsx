"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CornerDownRight, RotateCcw, Sparkles } from "lucide-react";
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

function normalizeImageUrl(imageUrl: string | null | undefined) {
  if (!imageUrl?.trim()) return null;
  const value = imageUrl.trim();
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("//") ||
    value.startsWith("/")
  )
    return value;
  return `/${value}`;
}

function getCategoryImage(category: Category, allCategories: Category[]) {
  const ownImage = normalizeImageUrl(category.image_url);
  if (ownImage) return ownImage;

  const children = allCategories
    .filter((child) => child.parent_id === category.id && child.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);

  for (const child of children) {
    const childImage = normalizeImageUrl(child.image_url);
    if (childImage) return childImage;
  }
  return null;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } else {
        setCategories((data as Category[]) ?? []);
      }
      setLoading(false);
    }
    fetchCategories();
  }, []);

  const mainCategories = useMemo(
    () => categories.filter((category) => category.parent_id === null),
    [categories]
  );

  const children = useMemo(() => {
    const map = new Map<string, Category[]>();
    categories
      .filter((category) => category.parent_id)
      .forEach((category) => {
        const parentId = category.parent_id;
        if (!parentId) return;
        map.set(parentId, [...(map.get(parentId) ?? []), category]);
      });
    return map;
  }, [categories]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f2ec] text-[#2d2420]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#2d2420]/10 border-t-[#c8a26a]" />
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-[#2d2420]/40">
            Loading categories...
          </p>
        </div>
      </main>
    );
  }

  if (categories.length === 0) {
    return <CategoriesErrorState message="No categories found." />;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f2ec] text-[#2d2420]">
      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-[#2d2420]/10 px-5 pb-20 pt-28 sm:px-8 sm:pb-24 sm:pt-36 lg:px-10 lg:pb-28">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(145deg,#ffffff_0%,#f6f2ec_58%,#f3d5b5_145%)]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-32 -top-40 -z-10 h-[36rem] w-[36rem] rounded-full bg-[#f3d5b5]/55 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-40 left-[42%] -z-10 h-80 w-80 rounded-full bg-[#c8a26a]/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute right-[8%] top-28 hidden select-none font-serif text-[13rem] italic leading-none text-[#2d2420]/[0.035] lg:block"
        >
          01
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="grid items-end gap-12 lg:grid-cols-[1fr_23rem]">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#a89f91]/20 bg-white/70 px-3.5 py-2 shadow-sm backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-[#a89f91]" />
                <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#a89f91]">
                  Explore the collection
                </span>
              </div>
              <h1 className="mt-7 max-w-4xl font-serif text-[clamp(3.6rem,8vw,7.4rem)] leading-[0.86] text-[#2d2420]">
                Shop by <span className="italic text-[#a89f91]">category.</span>
              </h1>
              <p className="mt-7 max-w-xl text-sm leading-7 text-[#2d2420]/55 sm:text-base">
                Purposeful nutrition for every routine. Discover formulas made to
                support your goals, your pace and your everyday progress.
              </p>
            </div>

            <div className="border-l border-[#a89f91]/25 pl-6 sm:pl-8">
              <p className="font-serif text-5xl italic text-[#a89f91]">
                {String(mainCategories.length).padStart(2, "0")}
              </p>
              <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.25em] text-[#2d2420]/45">
                Curated categories
              </p>
              <p className="mt-5 text-xs leading-6 text-[#2d2420]/45">
                Clean ingredients. Thoughtful formulas. A better foundation for
                every goal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="relative px-4 py-14 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,#ffffff,transparent_30%),radial-gradient(circle_at_90%_75%,#f3d5b5,transparent_32%)] opacity-70"
        />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-9 flex items-end justify-between gap-6 sm:mb-12">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.26em] text-[#a89f91]">
                The complete edit
              </p>
              <h2 className="mt-3 font-serif text-3xl leading-none sm:text-5xl">
                Made for your routine.
              </h2>
            </div>
            <div className="hidden items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#2d2420]/40 sm:flex">
              <span className="h-px w-10 bg-[#a89f91]/40" /> Choose your focus
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {mainCategories.map((category, index) => {
              const imageUrl = getCategoryImage(category, categories);
              const subCategories = children.get(category.id) ?? [];

              return (
                <article
                  key={category.id}
                  className="group overflow-hidden rounded-2xl border border-[#2d2420]/10 bg-white/80 shadow-[0_18px_48px_rgba(45,36,32,0.10)] transition duration-500 hover:-translate-y-1.5 hover:border-[#c8a26a]/50 hover:shadow-[0_28px_70px_rgba(45,36,32,0.16)] sm:rounded-3xl"
                >
                  <Link
                    href={`/shop?category=${encodeURIComponent(category.slug)}`}
                    className="relative block aspect-[0.78] overflow-hidden"
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={category.name}
                        loading={index < 4 ? "eager" : "lazy"}
                        draggable={false}
                        className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.07]"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#f3d5b5]/45 px-5 text-center font-serif text-xl text-[#2d2420]/25">
                        {category.name}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#2d2420] via-[#2d2420]/25 to-transparent opacity-90" />
                    <div className="absolute inset-3 rounded-xl border border-white/20 transition duration-500 group-hover:inset-2 sm:inset-4 sm:rounded-2xl" />

                    <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-6">
                      <span className="font-serif text-sm italic text-[#c8a26a]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-md transition duration-300 group-hover:bg-[#c8a26a] group-hover:text-[#2d2420] sm:h-10 sm:w-10">
                        <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </span>
                    </div>

                    {category.is_featured && (
                      <span className="absolute left-4 top-12 rounded-full border border-[#c8a26a]/30 bg-[#2d2420]/30 px-2 py-1 text-[7px] font-bold uppercase tracking-[0.18em] text-[#c8a26a] backdrop-blur sm:left-6 sm:top-16">
                        Featured
                      </span>
                    )}

                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
                      <h3 className="font-serif text-[1.35rem] leading-[0.95] text-white sm:text-[1.8rem]">
                        {category.name}
                      </h3>
                      <p className="mt-2 hidden line-clamp-2 text-[10px] leading-5 text-white/60 sm:block">
                        {category.description ?? "Explore the full collection."}
                      </p>
                      <div className="mt-4 h-px bg-white/20">
                        <div className="h-full w-10 bg-[#c8a26a] transition-all duration-500 group-hover:w-full" />
                      </div>
                    </div>
                  </Link>

                  {subCategories.length > 0 && (
                    <div className="border-t border-[#2d2420]/10 bg-[#f3d5b5]/20 p-3 sm:px-5 sm:py-4">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-[7px] font-bold uppercase tracking-[0.2em] text-[#a89f91]">
                          Explore more
                        </p>
                        <span className="text-[8px] font-semibold text-[#2d2420]/30">
                          {String(subCategories.length).padStart(2, "0")}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        {subCategories.map((subCategory) => (
                          <Link
                            key={subCategory.id}
                            href={`/shop?category=${encodeURIComponent(
                              subCategory.slug
                            )}`}
                            className="group/sub flex min-h-8 items-center gap-1.5 rounded-lg px-1.5 text-[10px] font-medium text-[#2d2420]/60 transition hover:bg-white hover:text-[#a89f91] sm:text-[11px]"
                          >
                            <CornerDownRight className="h-3 w-3 shrink-0 text-[#a89f91]/55 transition group-hover/sub:translate-x-0.5" />
                            <span className="truncate">{subCategory.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-16 sm:px-8 sm:pb-24 lg:px-10">
        <div className="relative mx-auto min-h-[27rem] max-w-7xl overflow-hidden rounded-3xl bg-[#2d2420] sm:min-h-[32rem]">
          <img
            src="/hero/hero-runner.jpg"
            alt="Explore the complete nutrition collection"
            className="absolute inset-0 h-full w-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2d2420] via-[#2d2420]/85 to-[#2d2420]/20" />
          <div className="absolute inset-3 rounded-2xl border border-white/15 sm:inset-5" />
          <div className="relative flex min-h-[27rem] max-w-2xl flex-col justify-center px-7 py-14 sm:min-h-[32rem] sm:px-14 lg:px-20">
            <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#c8a26a]">
              Build your complete stack
            </p>
            <h2 className="mt-5 font-serif text-4xl leading-[0.95] text-white sm:text-6xl">
              Everything you need.
              <br />
              <span className="italic text-[#c8a26a]">One collection.</span>
            </h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-white/65">
              Bring your training, recovery and everyday wellness together with
              nutrition made to work as hard as you do.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex h-12 w-fit items-center gap-3 rounded-full bg-[#c8a26a] px-6 text-[9px] font-bold uppercase tracking-[0.2em] text-[#2d2420] shadow-lg transition hover:-translate-y-0.5 hover:brightness-105"
            >
              Start shopping <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function CategoriesErrorState({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f2ec] px-5 text-center text-[#2d2420]">
      <div>
        <RotateCcw className="mx-auto h-6 w-6 text-[#a89f91]" />
        <h1 className="mt-5 font-serif text-4xl">Something went wrong.</h1>
        <p className="mt-4 text-sm text-[#2d2420]/50">{message}</p>
      </div>
    </main>
  );
}
