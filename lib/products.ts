import { supabase } from "./supabase";

export type ProductImage = {
  id: string;
  image_url: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
  variant_id: string | null;
  image_type: string;
};

export type ProductVariant = {
  id: string;
  flavor?: string;
  size?: string;
  servings?: number;
  price: number;
  compareAt?: number;
  stock: number;
  sku: string;
  image?: string;
  available: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  subtitle: string;
  category: string;
  categoryId: string;
  parentCategoryId: string | null;
  description: string;
  shortDescription?: string;
  image?: string;
  images: string[];
  productImages: ProductImage[];

  price: number;
  compareAt?: number;
  sku?: string;
  stock: number;
  available: boolean;
  hasVariants: boolean;

  rating: number;
  reviews: number;
  bestseller: boolean;
  featured: boolean;
  active: boolean;

  variants: ProductVariant[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;

  parent_id: string | null;
  parent_category_id: string | null;

  sort_order: number;
  created_at: string;
  is_active: boolean;
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  sort_order: number;
  created_at: string;
  is_active: boolean;
};

export type ProductSortOption =
  | "featured"
  | "price-low"
  | "price-high"
  | "rating";

type ProductImageRow = {
  id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  variant_id: string | null;
  image_type: string | null;
};

type ProductVariantRow = {
  id: string;
  sku: string;
  flavor: string | null;
  size: string | null;
  servings: number | null;
  price: number;
  compare_at_price: number | null;
  image_url: string | null;
  is_available: boolean;
  created_at: string;

  inventory:
    | {
        stock_quantity: number | null;
      }
    | {
        stock_quantity: number | null;
      }[]
    | null;
};

type ProductRow = {
  id: string;
  brand_id: string;
  category_id: string;
  parent_category_id: string | null;

  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  short_description: string | null;

  price: number | null;
  compare_at_price: number | null;
  sku: string | null;
  stock_quantity: number | null;
  is_available: boolean | null;

  rating: number;
  review_count: number;

  is_featured: boolean;
  is_bestseller: boolean;
  is_active: boolean;

  brands:
    | {
        name: string;
      }
    | null;

  categories:
    | {
        id: string;
        name: string;
        slug: string;
      }
    | null;

  product_images: ProductImageRow[];
  product_variants: ProductVariantRow[];
};

function logSupabaseError(label: string, error: unknown) {
  const err = error as {
    message?: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null;

  console.error(label, {
    raw: error,
    message: err?.message ?? String(error ?? "Unknown Supabase error"),
    details: err?.details,
    hint: err?.hint,
    code: err?.code,
  });
}

export function normalizeSize(value?: string | null): string {
  if (!value) return "";

  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/kilograms?/g, "kg")
    .replace(/kgs?/g, "kg");
}

export function sameSize(
  first?: string | null,
  second?: string | null,
): boolean {
  return normalizeSize(first) === normalizeSize(second);
}

function sortImages(images: ProductImage[]): ProductImage[] {
  return [...images].sort((a, b) => {
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }

    if (a.is_primary !== b.is_primary) {
      return a.is_primary ? -1 : 1;
    }

    return a.id.localeCompare(b.id);
  });
}

function getVariantImages(
  images: ProductImage[],
  variantId: string,
): ProductImage[] {
  return sortImages(
    images.filter((image) => image.variant_id === variantId),
  );
}

function getCommonImages(images: ProductImage[]): ProductImage[] {
  return sortImages(
    images.filter((image) => image.variant_id === null),
  );
}

function getVariantPrimaryImage(
  variant: ProductVariantRow,
  images: ProductImage[],
): string | undefined {
  const variantImages = getVariantImages(images, variant.id);

  const variantPrimary = variantImages.find(
    (image) => image.is_primary,
  );

  if (variantPrimary?.image_url) {
    return variantPrimary.image_url;
  }

  const commonImages = getCommonImages(images);

  const commonPrimary = commonImages.find(
    (image) => image.is_primary,
  );

  if (commonPrimary?.image_url) {
    return commonPrimary.image_url;
  }

  return (
    commonImages[0]?.image_url ??
    variantImages[0]?.image_url ??
    variant.image_url ??
    undefined
  );
}

function mapVariant(
  variant: ProductVariantRow,
  images: ProductImage[],
): ProductVariant {
  const inventoryRow = Array.isArray(variant.inventory)
    ? variant.inventory[0]
    : variant.inventory;

  const stock = Math.max(
    0,
    Number(inventoryRow?.stock_quantity ?? 0),
  );

  return {
    id: variant.id,
    flavor: variant.flavor ?? undefined,
    size: variant.size ?? undefined,
    servings: variant.servings ?? undefined,
    price: Number(variant.price ?? 0),
    compareAt:
      variant.compare_at_price != null
        ? Number(variant.compare_at_price)
        : undefined,
    stock,
    sku: variant.sku ?? "",
    image: getVariantPrimaryImage(variant, images),
    available:
      Boolean(variant.is_available) &&
      stock > 0,
  };
}

function mapProduct(product: ProductRow): Product {
  const allImages: ProductImage[] = (
    product.product_images ?? []
  )
    .filter((image) => Boolean(image.image_url))
    .map(
      (image): ProductImage => ({
        id: image.id,
        image_url: image.image_url,
        alt_text: image.alt_text ?? "",
        sort_order: Number(image.sort_order ?? 0),
        is_primary: Boolean(image.is_primary),
        variant_id: image.variant_id ?? null,
        image_type: image.image_type ?? "gallery",
      }),
    );

  const commonImages = getCommonImages(allImages);

  const rawVariants = [
    ...(product.product_variants ?? []),
  ].sort(
    (a, b) =>
      new Date(a.created_at).getTime() -
      new Date(b.created_at).getTime(),
  );

  const variants = rawVariants.map((variant) =>
    mapVariant(variant, allImages),
  );

  const hasVariants = variants.length > 0;

  const firstAvailableVariant = hasVariants
    ? variants.find((variant) => variant.available) ??
      variants[0]
    : undefined;

  const productMainImage =
    commonImages.find((image) => image.is_primary)?.image_url ??
    commonImages[0]?.image_url ??
    firstAvailableVariant?.image;

  const simplePrice = Math.max(
    0,
    Number(product.price ?? 0),
  );

  const simpleCompareAt =
    product.compare_at_price != null
      ? Math.max(
          0,
          Number(product.compare_at_price),
        )
      : undefined;

  const simpleStock = Math.max(
    0,
    Number(product.stock_quantity ?? 0),
  );

  const simpleSku =
    product.sku?.trim() || undefined;

  const simpleAvailable =
    Boolean(product.is_available) &&
    simpleStock > 0;

  const price = hasVariants
    ? Number(firstAvailableVariant?.price ?? 0)
    : simplePrice;

  const compareAt = hasVariants
    ? firstAvailableVariant?.compareAt
    : simpleCompareAt;

  const sku = hasVariants
    ? firstAvailableVariant?.sku || undefined
    : simpleSku;

  const stock = hasVariants
    ? Math.max(
        0,
        Number(firstAvailableVariant?.stock ?? 0),
      )
    : simpleStock;

  const available = hasVariants
    ? Boolean(firstAvailableVariant?.available)
    : simpleAvailable;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brands?.name ?? "Brand",
    subtitle: product.subtitle ?? "",
    category: product.categories?.slug ?? "",
    categoryId: product.category_id,
    parentCategoryId: product.parent_category_id ?? null,
    description: product.description ?? "",
    shortDescription:
      product.short_description ?? undefined,
    image: productMainImage,
    images: allImages.map(
      (image) => image.image_url,
    ),
    productImages: allImages,
    price,
    compareAt,
    sku,
    stock,
    available,
    hasVariants,
    rating: Number(product.rating ?? 0),
    reviews: Number(product.review_count ?? 0),
    bestseller: Boolean(product.is_bestseller),
    featured: Boolean(product.is_featured),
    active: Boolean(product.is_active),
    variants,
  };
}

const productSelect = `
  id,
  brand_id,
  category_id,
  parent_category_id,
  name,
  slug,
  subtitle,
  description,
  short_description,
  price,
  compare_at_price,
  sku,
  stock_quantity,
  is_available,
  rating,
  review_count,
  is_featured,
  is_bestseller,
  is_active,

  brands (
    name
  ),

  categories!products_category_id_fkey (
    id,
    name,
    slug
  ),

  product_images (
    id,
    image_url,
    alt_text,
    sort_order,
    is_primary,
    variant_id,
    image_type
  ),

  product_variants (
    id,
    sku,
    flavor,
    size,
    servings,
    price,
    compare_at_price,
    image_url,
    is_available,
    created_at,

    inventory (
      stock_quantity
    )
  )
`;

const productSelectWithCategoryFilter = `
  id,
  brand_id,
  category_id,
  parent_category_id,
  name,
  slug,
  subtitle,
  description,
  short_description,
  price,
  compare_at_price,
  sku,
  stock_quantity,
  is_available,
  rating,
  review_count,
  is_featured,
  is_bestseller,
  is_active,

  brands (
    name
  ),

  categories:categories!products_category_id_fkey!inner (
    id,
    name,
    slug
  ),

  product_images (
    id,
    image_url,
    alt_text,
    sort_order,
    is_primary,
    variant_id,
    image_type
  ),

  product_variants (
    id,
    sku,
    flavor,
    size,
    servings,
    price,
    compare_at_price,
    image_url,
    is_available,
    created_at,

    inventory (
      stock_quantity
    )
  )
`;

export async function getProducts(): Promise<Product[]> {
  const {
    data,
    error,
  } = await supabase
    .from("products")
    .select(productSelect)
    .eq("is_active", true)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    logSupabaseError(
      "Products loading failed:",
      error,
    );

    return [];
  }

  return (
    (data ?? []) as unknown as ProductRow[]
  ).map(mapProduct);
}

export async function getProductsPage({
  page = 1,
  pageSize = 20,
  categoryId = "all",
  categoryIds,
  brandIds,
  search = "",
  sortBy = "featured",
}: {
  page?: number;
  pageSize?: number;
  categoryId?: string;
  categoryIds?: string[];
  brandIds?: string[];
  search?: string;
  sortBy?: ProductSortOption;
}): Promise<{
  products: Product[];
  total: number;
  totalPages: number;
}> {
  const safePage = Math.max(1, page);

  const safePageSize = Math.max(
    1,
    Math.min(20, pageSize),
  );

  const from =
    (safePage - 1) *
    safePageSize;

  const to =
    from +
    safePageSize -
    1;

  let query = supabase
    .from("products")
    .select(productSelect, {
      count: "exact",
    })
    .eq("is_active", true);

  if (
    categoryId &&
    categoryId !== "all"
  ) {
    const ids = (
      categoryIds ?? [categoryId]
    ).filter(Boolean);

    if (ids.length > 0) {
      query = query.or(
        `category_id.in.(${ids.join(",")}),parent_category_id.eq.${categoryId}`,
      );
    }
  }

  const cleanBrandIds = Array.from(
    new Set(
      (brandIds ?? []).filter(Boolean),
    ),
  );

  if (cleanBrandIds.length > 0) {
    query = query.in(
      "brand_id",
      cleanBrandIds,
    );
  }

  const cleanSearch = search.trim();

  if (cleanSearch) {
    const escapedSearch = cleanSearch
      .replace(/\\/g, "\\\\")
      .replace(/%/g, "\\%")
      .replace(/_/g, "\\_")
      .replace(/,/g, "\\,");

    query = query.or(
      `name.ilike.%${escapedSearch}%,slug.ilike.%${escapedSearch}%,subtitle.ilike.%${escapedSearch}%`,
    );
  }

  if (sortBy === "rating") {
    query = query
      .order("rating", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      });
  } else if (sortBy === "featured") {
    query = query
      .order("is_featured", {
        ascending: false,
      })
      .order("is_bestseller", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      });
  } else {
    query = query.order("created_at", {
      ascending: false,
    });
  }

  const {
    data,
    error,
    count,
  } = await query.range(from, to);

  if (error) {
    logSupabaseError(
      "Paginated products loading failed:",
      error,
    );

    return {
      products: [],
      total: 0,
      totalPages: 0,
    };
  }

  let products = (
    (data ?? []) as unknown as ProductRow[]
  ).map(mapProduct);

  if (sortBy === "price-low") {
    products.sort(
      (a, b) => a.price - b.price,
    );
  }

  if (sortBy === "price-high") {
    products.sort(
      (a, b) => b.price - a.price,
    );
  }

  const total = Number(count ?? 0);

  return {
    products,
    total,
    totalPages: Math.ceil(
      total / safePageSize,
    ),
  };
}

export async function getFeaturedProducts(
  limit = 8,
): Promise<Product[]> {
  try {
    const {
      data,
      error,
    } = await supabase
      .from("products")
      .select(productSelect)
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("created_at", {
        ascending: false,
      })
      .limit(limit);

    if (error) {
      logSupabaseError(
        "Featured products loading failed:",
        error,
      );

      return [];
    }

    return (
      (data ?? []) as unknown as ProductRow[]
    ).map(mapProduct);
  } catch (thrown) {
    logSupabaseError(
      "Featured products threw an exception:",
      thrown,
    );

    return [];
  }
}

export async function getProductBySlug(
  slug: string,
): Promise<Product | null> {
  const {
    data,
    error,
  } = await supabase
    .from("products")
    .select(productSelect)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    logSupabaseError(
      "Product loading failed:",
      error,
    );

    return null;
  }

  if (!data) {
    return null;
  }

  return mapProduct(
    data as unknown as ProductRow,
  );
}

export async function getCategories(): Promise<Category[]> {
  const {
    data,
    error,
  } = await supabase
    .from("categories")
    .select(
      `
        id,
        name,
        slug,
        parent_id,
        sort_order,
        created_at,
        is_active
      `,
    )
    .eq("is_active", true)
    .order("sort_order", {
      ascending: true,
    })
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    logSupabaseError(
      "Categories loading failed:",
      error,
    );

    return [];
  }

  return (
    (data ?? []) as Array<{
      id: string;
      name: string;
      slug: string;
      parent_id: string | null;
      sort_order: number | null;
      created_at: string | null;
      is_active: boolean | null;
    }>
  ).map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,

    parent_id: category.parent_id ?? null,

    parent_category_id:
      category.parent_id ?? null,

    sort_order: Number(
      category.sort_order ?? 0,
    ),

    created_at:
      category.created_at ?? "",

    is_active: Boolean(
      category.is_active,
    ),
  }));
}

export async function getBrands(): Promise<Brand[]> {
  const {
    data,
    error,
  } = await supabase
    .from("brands")
    .select(
      `
        id,
        name,
        slug,
        logo_url,
        sort_order,
        created_at,
        is_active
      `,
    )
    .eq("is_active", true)
    .order("sort_order", {
      ascending: true,
    })
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    logSupabaseError(
      "Brands loading failed:",
      error,
    );

    return [];
  }

  return (
    (data ?? []) as Array<{
      id: string;
      name: string;
      slug: string;
      logo_url: string | null;
      sort_order: number | null;
      created_at: string | null;
      is_active: boolean | null;
    }>
  ).map((brand) => ({
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logo_url: brand.logo_url ?? null,
    sort_order: Number(
      brand.sort_order ?? 0,
    ),
    created_at:
      brand.created_at ?? "",
    is_active: Boolean(
      brand.is_active,
    ),
  }));
}

export async function getProductsByCategory(
  categorySlug: string,
): Promise<Product[]> {
  const {
    data,
    error,
  } = await supabase
    .from("products")
    .select(
      productSelectWithCategoryFilter,
    )
    .eq("is_active", true)
    .eq("categories.slug", categorySlug)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    logSupabaseError(
      "Category products loading failed:",
      error,
    );

    return [];
  }

  return (
    (data ?? []) as unknown as ProductRow[]
  ).map(mapProduct);
}