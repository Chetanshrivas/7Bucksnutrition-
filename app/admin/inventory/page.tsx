"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

// ---------------------------------------------------------------------------
// Raw shapes coming back from Supabase
// ---------------------------------------------------------------------------

type RawInventoryRow = {
  id: string;
  variant_id: string;
  stock_quantity: number;
  reserved_quantity: number;
  low_stock_threshold: number;
  updated_at: string;

  variant: {
    id: string;
    product_id: string;
    sku: string;
    flavor: string | null;
    size: string | null;
    servings: number | null;
    price: number;
    compare_at_price: number | null;
    barcode: string | null;
    image_url: string | null;
    is_available: boolean;

    product: {
      id: string;
      name: string;
    } | null;
  } | null;
};

type RawSimpleProduct = {
  id: string;
  name: string;
  sku: string | null;
  price: number | null;
  compare_at_price: number | null;
  stock_quantity: number;
  is_available: boolean;
  updated_at: string;
};

// ---------------------------------------------------------------------------
// Normalized shape the rest of this page actually renders. A "variant" row
// comes from the inventory table (product has variants, stock lives per
// variant). A "simple" row is a product with NO rows in product_variants —
// that product keeps its own price/sku/stock directly on the products table,
// so it has no inventory row at all unless we add it in here ourselves.
// ---------------------------------------------------------------------------

type StockKind = "variant" | "simple";

type InventoryRow = {
  id: string; // unique key for this page: inventory.id, or `simple:<product.id>`
  kind: StockKind;
  variantId: string | null;
  productId: string;
  productName: string;
  variantLabel: string;
  sku: string | null;
  imageUrl: string | null;
  price: number;
  compareAtPrice: number | null;
  stockQuantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  updatedAt: string;
  isAvailable: boolean;
};

type StockStatus = "all" | "in_stock" | "low_stock" | "out_of_stock";

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getAvailableStock(item: InventoryRow) {
  return Math.max(
    0,
    Number(item.stockQuantity || 0) -
      Number(item.reservedQuantity || 0)
  );
}

function getStockStatus(item: InventoryRow): StockStatus {
  const available = getAvailableStock(item);

  if (available <= 0) return "out_of_stock";

  if (available <= Number(item.lowStockThreshold || 0)) {
    return "low_stock";
  }

  return "in_stock";
}

function formatVariantLabel(
  variant: RawInventoryRow["variant"]
) {
  if (!variant) return "Variant";

  const parts = [
    variant.flavor,
    variant.size,
    variant.servings
      ? `${variant.servings} servings`
      : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" • ") : "Default variant";
}

function normalizeVariantRow(
  row: RawInventoryRow
): InventoryRow {
  const variant = row.variant;

  return {
    id: row.id,
    kind: "variant",
    variantId: variant?.id ?? null,
    productId: variant?.product_id ?? "",
    productName:
      variant?.product?.name || "Unknown Product",
    variantLabel: formatVariantLabel(variant),
    sku: variant?.sku ?? null,
    imageUrl: variant?.image_url ?? null,
    price: Number(variant?.price || 0),
    compareAtPrice: variant?.compare_at_price ?? null,
    stockQuantity: Number(row.stock_quantity || 0),
    reservedQuantity: Number(row.reserved_quantity || 0),
    lowStockThreshold: Number(row.low_stock_threshold || 0),
    updatedAt: row.updated_at,
    isAvailable: variant?.is_available ?? true,
  };
}

function normalizeSimpleProduct(
  product: RawSimpleProduct
): InventoryRow {
  return {
    id: `simple:${product.id}`,
    kind: "simple",
    variantId: null,
    productId: product.id,
    productName: product.name || "Unknown Product",
    // These products don't have variants — this label just makes it
    // obvious in the list why there's no flavour/size shown.
    variantLabel: "Standalone product (no variants)",
    sku: product.sku ?? null,
    // products table has no image column of its own in this schema.
    imageUrl: null,
    price: Number(product.price || 0),
    compareAtPrice: product.compare_at_price ?? null,
    stockQuantity: Number(product.stock_quantity || 0),
    // products has no reserved_quantity / low_stock_threshold columns —
    // there's simply nothing reserved and no low-stock line for these.
    reservedQuantity: 0,
    lowStockThreshold: 0,
    updatedAt: product.updated_at,
    isAvailable: product.is_available ?? true,
  };
}

function Icon({
  name,
  size = 18,
}: {
  name: string;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "search") {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
    );
  }

  if (name === "refresh") {
    return (
      <svg {...common}>
        <path d="M20 11a8 8 0 0 0-14.8-4" />
        <path d="M4 4v5h5" />
        <path d="M4 13a8 8 0 0 0 14.8 4" />
        <path d="M20 20v-5h-5" />
      </svg>
    );
  }

  if (name === "package") {
    return (
      <svg {...common}>
        <path d="m21 8-9-5-9 5 9 5 9-5Z" />
        <path d="M3 8v9l9 5 9-5V8" />
        <path d="M12 13v9" />
      </svg>
    );
  }

  if (name === "edit") {
    return (
      <svg {...common}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </svg>
    );
  }

  if (name === "plus") {
    return (
      <svg {...common}>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    );
  }

  if (name === "minus") {
    return (
      <svg {...common}>
        <path d="M5 12h14" />
      </svg>
    );
  }

  if (name === "close") {
    return (
      <svg {...common}>
        <path d="m6 6 12 12" />
        <path d="m18 6-12 12" />
      </svg>
    );
  }

  if (name === "check") {
    return (
      <svg {...common}>
        <path d="m5 12 4 4L19 6" />
      </svg>
    );
  }

  if (name === "alert") {
    return (
      <svg {...common}>
        <path d="M10.3 3.8 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    );
  }

  return null;
}

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StockStatus>("all");

  const [editingItem, setEditingItem] =
    useState<InventoryRow | null>(null);

  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  async function fetchInventory(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // 1. Variant-based stock — unchanged from before.
      const { data: variantData, error: variantError } =
        await supabase
          .from("inventory")
          .select(`
            id,
            variant_id,
            stock_quantity,
            reserved_quantity,
            low_stock_threshold,
            updated_at,
            variant:product_variants (
              id,
              product_id,
              sku,
              flavor,
              size,
              servings,
              price,
              compare_at_price,
              barcode,
              image_url,
              is_available,
              product:products (
                id,
                name
              )
            )
          `)
          .order("updated_at", { ascending: false });

      if (variantError) {
        console.error(
          "Inventory fetch error:",
          variantError
        );
        alert(variantError.message);
        return;
      }

      // 2. Figure out which products already have variants, so we know
      //    which products are "standalone" (no variants at all) and
      //    manage their own stock directly on the products table.
      const { data: variantLinks, error: linkError } =
        await supabase
          .from("product_variants")
          .select("product_id");

      if (linkError) {
        console.error(
          "Product-variant lookup error:",
          linkError
        );
        alert(linkError.message);
        return;
      }

      const productIdsWithVariants = new Set(
        (variantLinks || []).map(
          (row) => row.product_id as string
        )
      );

      // 3. Standalone products: has its own price set, but zero rows in
      //    product_variants.
      const { data: simpleProducts, error: simpleError } =
        await supabase
          .from("products")
          .select(
            `
              id,
              name,
              sku,
              price,
              compare_at_price,
              stock_quantity,
              is_available,
              updated_at
            `
          )
          .not("price", "is", null)
          .order("updated_at", { ascending: false });

      if (simpleError) {
        console.error(
          "Standalone product fetch error:",
          simpleError
        );
        alert(simpleError.message);
        return;
      }

      const normalizedVariantRows = (
        (variantData || []) as unknown as RawInventoryRow[]
      ).map(normalizeVariantRow);

      const normalizedSimpleRows = (
        (simpleProducts || []) as RawSimpleProduct[]
      )
        .filter(
          (product) =>
            !productIdsWithVariants.has(product.id)
        )
        .map(normalizeSimpleProduct);

      const combined = [
        ...normalizedVariantRows,
        ...normalizedSimpleRows,
      ].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() -
          new Date(a.updatedAt).getTime()
      );

      setInventory(combined);
    } catch (error) {
      console.error("Inventory fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchInventory();
  }, []);

  async function updateQuickStock(
    item: InventoryRow,
    amount: number
  ) {
    const currentStock = Number(item.stockQuantity || 0);
    const nextStock = Math.max(0, currentStock + amount);

    if (
      amount < 0 &&
      nextStock < Number(item.reservedQuantity || 0)
    ) {
      alert(
        "Stock cannot be lower than the currently reserved quantity."
      );
      return;
    }

    try {
      setUpdatingId(item.id);

      if (item.kind === "variant") {
        const { data, error } = await supabase
          .from("inventory")
          .update({
            stock_quantity: nextStock,
          })
          .eq("id", item.id)
          .select()
          .single();

        if (error) {
          console.error("Stock update error:", error);
          alert(error.message);
          return;
        }

        setInventory((current) =>
          current.map((row) =>
            row.id === item.id
              ? {
                  ...row,
                  stockQuantity: data.stock_quantity,
                  updatedAt: data.updated_at,
                }
              : row
          )
        );
      } else {
        const { data, error } = await supabase
          .from("products")
          .update({
            stock_quantity: nextStock,
          })
          .eq("id", item.productId)
          .select()
          .single();

        if (error) {
          console.error("Stock update error:", error);
          alert(error.message);
          return;
        }

        setInventory((current) =>
          current.map((row) =>
            row.id === item.id
              ? {
                  ...row,
                  stockQuantity: data.stock_quantity,
                  updatedAt: data.updated_at,
                }
              : row
          )
        );
      }
    } finally {
      setUpdatingId(null);
    }
  }

  async function saveInventoryChanges(data: {
    stock_quantity: number;
    reserved_quantity: number;
    low_stock_threshold: number;
  }) {
    if (!editingItem) return;

    if (data.stock_quantity < 0) {
      alert("Stock quantity cannot be negative.");
      return;
    }

    if (editingItem.kind === "variant") {
      if (data.reserved_quantity < 0) {
        alert("Reserved quantity cannot be negative.");
        return;
      }

      if (data.low_stock_threshold < 0) {
        alert("Low stock threshold cannot be negative.");
        return;
      }

      if (data.reserved_quantity > data.stock_quantity) {
        alert(
          "Reserved quantity cannot be greater than stock quantity."
        );
        return;
      }

      try {
        setSaving(true);

        const { data: updated, error } = await supabase
          .from("inventory")
          .update({
            stock_quantity: data.stock_quantity,
            reserved_quantity: data.reserved_quantity,
            low_stock_threshold: data.low_stock_threshold,
          })
          .eq("id", editingItem.id)
          .select()
          .single();

        if (error) {
          console.error("Inventory update error:", error);
          alert(error.message);
          return;
        }

        setInventory((current) =>
          current.map((item) =>
            item.id === editingItem.id
              ? {
                  ...item,
                  stockQuantity: updated.stock_quantity,
                  reservedQuantity:
                    updated.reserved_quantity,
                  lowStockThreshold:
                    updated.low_stock_threshold,
                  updatedAt: updated.updated_at,
                }
              : item
          )
        );

        setEditingItem(null);
      } finally {
        setSaving(false);
      }
    } else {
      // Standalone product — products table only has stock_quantity,
      // there's no reserved_quantity / low_stock_threshold column to save.
      try {
        setSaving(true);

        const { data: updated, error } = await supabase
          .from("products")
          .update({
            stock_quantity: data.stock_quantity,
          })
          .eq("id", editingItem.productId)
          .select()
          .single();

        if (error) {
          console.error("Product stock update error:", error);
          alert(error.message);
          return;
        }

        setInventory((current) =>
          current.map((item) =>
            item.id === editingItem.id
              ? {
                  ...item,
                  stockQuantity: updated.stock_quantity,
                  updatedAt: updated.updated_at,
                }
              : item
          )
        );

        setEditingItem(null);
      } finally {
        setSaving(false);
      }
    }
  }

  const filteredInventory = useMemo(() => {
    const query = search.trim().toLowerCase();

    return inventory.filter((item) => {
      const searchableText = [
        item.productName,
        item.sku,
        item.variantLabel,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        getStockStatus(item) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [inventory, search, statusFilter]);

  const stats = useMemo(() => {
    let totalUnits = 0;
    let reservedUnits = 0;

    inventory.forEach((item) => {
      totalUnits += Number(item.stockQuantity || 0);
      reservedUnits += Number(item.reservedQuantity || 0);
    });

    return {
      variants: inventory.length,
      totalUnits,
      reservedUnits,
      availableUnits: Math.max(
        0,
        totalUnits - reservedUnits
      ),
      lowStock: inventory.filter(
        (item) => getStockStatus(item) === "low_stock"
      ).length,
      outOfStock: inventory.filter(
        (item) => getStockStatus(item) === "out_of_stock"
      ).length,
    };
  }, [inventory]);

  return (
    <main className="min-h-screen bg-[#f3f0e9] text-[#171512]">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-9">

        {/* HEADER */}
        <section className="relative overflow-hidden rounded-[28px] bg-[#171512] px-6 py-7 text-[#f5f2eb] shadow-[0_18px_60px_rgba(23,21,18,0.12)] sm:px-8 sm:py-8 lg:px-10">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#cdb47b]/10 blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#cdb47b]" />

                <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#cdb47b]">
                  Seven Bucks Nutrition
                </p>
              </div>

              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
                Inventory
              </h1>

              <p className="mt-3 max-w-xl text-xs leading-6 text-white/45 sm:text-sm">
                Manage stock, reserved units and low-stock
                thresholds for every product variant — plus
                stock for standalone products with no variants.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchInventory(true)}
              disabled={refreshing}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#cdb47b] px-5 text-[9px] font-bold uppercase tracking-[0.14em] text-[#171512] transition hover:bg-[#d8c28e] disabled:opacity-50"
            >
              <Icon name="refresh" size={15} />
              {refreshing ? "Refreshing" : "Refresh"}
            </button>
          </div>
        </section>

        {/* STATS */}
        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard
            label="Variants"
            value={stats.variants}
          />

          <StatCard
            label="Total Stock"
            value={stats.totalUnits}
          />

          <StatCard
            label="Available"
            value={stats.availableUnits}
          />

          <StatCard
            label="Reserved"
            value={stats.reservedUnits}
          />

          <StatCard
            label="Low Stock"
            value={stats.lowStock}
            warning={stats.lowStock > 0}
          />

          <StatCard
            label="Out of Stock"
            value={stats.outOfStock}
            danger={stats.outOfStock > 0}
          />
        </section>

        {/* FILTERS */}
        <section className="mt-5 rounded-[24px] border border-black/[0.07] bg-white p-4 shadow-[0_8px_30px_rgba(23,21,18,0.035)] sm:p-5">
          <div className="flex flex-col gap-3 xl:flex-row">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/30">
                <Icon name="search" size={17} />
              </div>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search product, SKU, flavour, size..."
                className="h-12 w-full rounded-2xl border border-black/[0.08] bg-[#faf9f6] pl-11 pr-4 text-xs outline-none transition placeholder:text-black/25 focus:border-[#cdb47b] focus:bg-white"
              />
            </div>

            <div className="relative xl:w-[220px]">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as StockStatus
                  )
                }
                className="h-12 w-full appearance-none rounded-2xl border border-black/[0.08] bg-[#faf9f6] px-4 text-[10px] font-semibold outline-none focus:border-[#cdb47b]"
              >
                <option value="all">
                  All Stock Status
                </option>
                <option value="in_stock">
                  In Stock
                </option>
                <option value="low_stock">
                  Low Stock
                </option>
                <option value="out_of_stock">
                  Out of Stock
                </option>
              </select>

              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-black/30">
                ▾
              </span>
            </div>

            {(search || statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="h-12 rounded-2xl border border-black/[0.08] px-5 text-[9px] font-bold uppercase tracking-[0.13em] text-black/45 transition hover:border-black/20 hover:text-black"
              >
                Clear
              </button>
            )}
          </div>
        </section>

        {/* INVENTORY TABLE */}
        <section className="mt-5 overflow-hidden rounded-[24px] border border-black/[0.07] bg-white shadow-[0_8px_30px_rgba(23,21,18,0.035)]">
          <div className="flex flex-col gap-3 border-b border-black/[0.07] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#cdb47b]" />

                <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-[#9c8250]">
                  Stock Management
                </p>
              </div>

              <h2 className="mt-1.5 text-lg font-semibold tracking-[-0.03em]">
                Product inventory
              </h2>
            </div>

            <p className="text-[10px] text-black/35">
              {filteredInventory.length} of{" "}
              {inventory.length} items
            </p>
          </div>

          {loading ? (
            <LoadingState />
          ) : filteredInventory.length === 0 ? (
            <EmptyState hasInventory={inventory.length > 0} />
          ) : (
            <>
              {/* DESKTOP */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1150px]">
                  <thead>
                    <tr className="border-b border-black/[0.06] bg-[#faf9f6]">
                      <TableHead>
                        Product / Variant
                      </TableHead>

                      <TableHead>SKU</TableHead>

                      <TableHead>Price</TableHead>

                      <TableHead>Stock</TableHead>

                      <TableHead>Reserved</TableHead>

                      <TableHead>Status</TableHead>

                      <TableHead>Updated</TableHead>

                      <TableHead align="right">
                        Actions
                      </TableHead>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredInventory.map((item) => {
                      const available =
                        getAvailableStock(item);

                      const status =
                        getStockStatus(item);

                      return (
                        <tr
                          key={item.id}
                          className="border-b border-black/[0.05] last:border-b-0 hover:bg-[#fcfbf8]"
                        >
                          <td className="px-5 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f3f0e9]">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Icon
                                    name="package"
                                    size={17}
                                  />
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="max-w-[220px] truncate text-xs font-semibold">
                                    {item.productName}
                                  </p>

                                  {item.kind ===
                                    "simple" && (
                                    <span className="shrink-0 rounded-full border border-[#cdb47b]/40 bg-[#cdb47b]/10 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-[0.08em] text-[#9c8250]">
                                      No Variants
                                    </span>
                                  )}
                                </div>

                                <p className="mt-1 max-w-[280px] truncate text-[9px] text-black/40">
                                  {item.variantLabel}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <span className="rounded-lg bg-[#f3f0e9] px-2.5 py-1.5 font-mono text-[8px] font-semibold text-black/55">
                              {item.sku || "—"}
                            </span>
                          </td>

                          <td className="px-5 py-5">
                            <p className="text-xs font-bold">
                              {formatMoney(item.price)}
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  updateQuickStock(
                                    item,
                                    -1
                                  )
                                }
                                disabled={
                                  updatingId ===
                                  item.id ||
                                  item.stockQuantity <=
                                    item.reservedQuantity
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-black/10 text-black/45 transition hover:bg-black hover:text-white disabled:opacity-30"
                              >
                                <Icon
                                  name="minus"
                                  size={12}
                                />
                              </button>

                              <span className="min-w-[38px] text-center text-sm font-bold">
                                {item.stockQuantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  updateQuickStock(
                                    item,
                                    1
                                  )
                                }
                                disabled={
                                  updatingId ===
                                  item.id
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-black/10 text-black/45 transition hover:bg-[#171512] hover:text-white disabled:opacity-30"
                              >
                                <Icon
                                  name="plus"
                                  size={12}
                                />
                              </button>
                            </div>

                            <p className="mt-1 text-[8px] text-black/30">
                              {available} available
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            <p className="text-xs font-semibold">
                              {item.kind === "variant"
                                ? item.reservedQuantity
                                : "—"}
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            <StockBadge
                              status={status}
                            />
                          </td>

                          <td className="px-5 py-5">
                            <p className="text-[9px] text-black/40">
                              {formatDate(
                                item.updatedAt
                              )}
                            </p>
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingItem(item)
                                }
                                className="flex h-9 items-center gap-2 rounded-xl border border-black/[0.08] px-3 text-[8px] font-bold uppercase tracking-[0.1em] text-black/45 transition hover:border-black/20 hover:bg-[#f3f0e9] hover:text-black"
                              >
                                <Icon
                                  name="edit"
                                  size={13}
                                />
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE */}
              <div className="divide-y divide-black/[0.06] lg:hidden">
                {filteredInventory.map((item) => {
                  const status = getStockStatus(item);
                  const available =
                    getAvailableStock(item);

                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f3f0e9]">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Icon
                                name="package"
                                size={17}
                              />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <p className="truncate text-xs font-semibold">
                                {item.productName}
                              </p>

                              {item.kind === "simple" && (
                                <span className="shrink-0 rounded-full border border-[#cdb47b]/40 bg-[#cdb47b]/10 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-[0.08em] text-[#9c8250]">
                                  No Variants
                                </span>
                              )}
                            </div>

                            <p className="mt-1 truncate text-[9px] text-black/40">
                              {item.variantLabel}
                            </p>

                            <p className="mt-1 font-mono text-[8px] text-black/30">
                              {item.sku || "No SKU"}
                            </p>
                          </div>
                        </div>

                        <StockBadge status={status} />
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <MiniInfo
                          label="Stock"
                          value={String(
                            item.stockQuantity
                          )}
                        />

                        <MiniInfo
                          label="Available"
                          value={String(available)}
                        />

                        <MiniInfo
                          label="Reserved"
                          value={
                            item.kind === "variant"
                              ? String(
                                  item.reservedQuantity
                                )
                              : "—"
                          }
                        />
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuickStock(item, -1)
                          }
                          disabled={
                            updatingId === item.id ||
                            item.stockQuantity <=
                              item.reservedQuantity
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 disabled:opacity-30"
                        >
                          <Icon
                            name="minus"
                            size={14}
                          />
                        </button>

                        <div className="flex h-10 flex-1 items-center justify-center rounded-xl bg-[#faf9f6] text-xs font-bold">
                          {item.stockQuantity} units
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuickStock(item, 1)
                          }
                          disabled={
                            updatingId === item.id
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 disabled:opacity-30"
                        >
                          <Icon
                            name="plus"
                            size={14}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setEditingItem(item)
                          }
                          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#171512] px-4 text-[8px] font-bold uppercase tracking-[0.1em] text-white"
                        >
                          <Icon
                            name="edit"
                            size={13}
                          />
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>

      {/* EDIT MODAL */}
      {editingItem && (
        <EditInventoryModal
          item={editingItem}
          saving={saving}
          onClose={() => setEditingItem(null)}
          onSave={saveInventoryChanges}
        />
      )}
    </main>
  );
}

function StatCard({
  label,
  value,
  warning = false,
  danger = false,
}: {
  label: string;
  value: number;
  warning?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="rounded-[22px] border border-black/[0.07] bg-white p-5 shadow-[0_6px_24px_rgba(23,21,18,0.025)]">
      <div className="flex items-start justify-between">
        <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-black/35">
          {label}
        </p>

        {(warning || danger) && (
          <Icon
            name="alert"
            size={14}
          />
        )}
      </div>

      <p
        className={`mt-5 text-2xl font-semibold tracking-[-0.05em] ${
          danger
            ? "text-red-600"
            : warning
            ? "text-[#9c8250]"
            : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function StockBadge({
  status,
}: {
  status: StockStatus;
}) {
  if (status === "in_stock") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[8px] font-bold text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        In Stock
      </span>
    );
  }

  if (status === "low_stock") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#e7d9b8] bg-[#f7f0df] px-2.5 py-1 text-[8px] font-bold text-[#856b32]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#cdb47b]" />
        Low Stock
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[8px] font-bold text-red-600">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
      Out of Stock
    </span>
  );
}

function MiniInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#faf9f6] p-3">
      <p className="text-[7px] font-bold uppercase tracking-[0.15em] text-black/30">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold">
        {value}
      </p>
    </div>
  );
}

function TableHead({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-5 py-3 text-[8px] font-bold uppercase tracking-[0.17em] text-black/30 ${
        align === "right"
          ? "text-right"
          : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[420px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3f0e9]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/10 border-t-[#171512]" />
        </div>

        <p className="mt-4 text-xs font-semibold">
          Loading inventory
        </p>

        <p className="mt-1 text-[9px] text-black/35">
          Fetching product stock data...
        </p>
      </div>
    </div>
  );
}

function EmptyState({
  hasInventory,
}: {
  hasInventory: boolean;
}) {
  return (
    <div className="flex min-h-[420px] items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#f3f0e9] text-black/30">
          <Icon name="package" size={25} />
        </div>

        <p className="mt-5 text-base font-semibold">
          {hasInventory
            ? "No matching inventory"
            : "No inventory yet"}
        </p>

        <p className="mt-2 text-[10px] leading-5 text-black/35">
          {hasInventory
            ? "Try changing your search or stock filter."
            : "Create inventory records for your product variants — or add a standalone product with a price — to see them here."}
        </p>
      </div>
    </div>
  );
}

function EditInventoryModal({
  item,
  saving,
  onClose,
  onSave,
}: {
  item: InventoryRow;
  saving: boolean;
  onClose: () => void;
  onSave: (data: {
    stock_quantity: number;
    reserved_quantity: number;
    low_stock_threshold: number;
  }) => void;
}) {
  const isSimple = item.kind === "simple";

  const [stock, setStock] = useState(
    String(item.stockQuantity)
  );

  const [reserved, setReserved] = useState(
    String(item.reservedQuantity)
  );

  const [threshold, setThreshold] = useState(
    String(item.lowStockThreshold)
  );

  const stockNumber = Number(stock || 0);
  const reservedNumber = isSimple
    ? 0
    : Number(reserved || 0);

  const available = Math.max(
    0,
    stockNumber - reservedNumber
  );

  const status =
    available <= 0
      ? "out_of_stock"
      : !isSimple && available <= Number(threshold || 0)
      ? "low_stock"
      : "in_stock";

  function submit(event: React.FormEvent) {
    event.preventDefault();

    onSave({
      stock_quantity: Number(stock || 0),
      reserved_quantity: isSimple
        ? 0
        : Number(reserved || 0),
      low_stock_threshold: isSimple
        ? 0
        : Number(threshold || 0),
    });
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close inventory editor"
        onClick={onClose}
        className="absolute inset-0 bg-black/55 backdrop-blur-md"
      />

      <form
        onSubmit={submit}
        className="relative z-10 w-full max-w-[560px] overflow-hidden rounded-[28px] bg-[#f3f0e9] shadow-2xl"
      >
        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-black/[0.07] bg-white px-6 py-5">
          <div className="min-w-0">
            <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#9c8250]">
              Inventory Editor
            </p>

            <h2 className="mt-1.5 truncate text-lg font-semibold tracking-[-0.04em]">
              {item.productName}
            </h2>

            <p className="mt-1 truncate text-[9px] text-black/40">
              {item.variantLabel}
            </p>

            <p className="mt-1 font-mono text-[8px] text-black/30">
              {item.sku}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-black/45 hover:text-black"
          >
            <Icon name="close" size={17} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6">
          {/* STATUS */}
          <div className="rounded-2xl border border-black/[0.07] bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-black/30">
                  Current Status
                </p>

                <p className="mt-1 text-[10px] text-black/40">
                  Based on available stock
                </p>
              </div>

              <StockBadge
                status={status as StockStatus}
              />
            </div>

            <div
              className={`mt-4 grid gap-2 ${
                isSimple ? "grid-cols-2" : "grid-cols-3"
              }`}
            >
              <MiniInfo
                label="Stock"
                value={String(stockNumber)}
              />

              {!isSimple && (
                <MiniInfo
                  label="Reserved"
                  value={String(reservedNumber)}
                />
              )}

              <MiniInfo
                label="Available"
                value={String(available)}
              />
            </div>
          </div>

          {/* FIELDS */}
          <div className="mt-4 space-y-4">
            <NumberField
              label="Stock Quantity"
              value={stock}
              onChange={setStock}
              min={0}
            />

            {isSimple ? (
              <p className="rounded-2xl border border-black/[0.07] bg-white p-3 text-[9px] leading-5 text-black/40">
                This product has no variants, so it doesn't
                track reserved units or a low-stock
                threshold separately — only its stock
                quantity is stored.
              </p>
            ) : (
              <>
                <NumberField
                  label="Reserved Quantity"
                  value={reserved}
                  onChange={setReserved}
                  min={0}
                />

                <NumberField
                  label="Low Stock Threshold"
                  value={threshold}
                  onChange={setThreshold}
                  min={0}
                />
              </>
            )}
          </div>

          {!isSimple && reservedNumber > stockNumber && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-[9px] leading-5 text-red-600">
              Reserved quantity cannot be greater than
              stock quantity.
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-3 border-t border-black/[0.07] bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-10 rounded-xl border border-black/[0.08] px-5 text-[9px] font-bold uppercase tracking-[0.12em] text-black/45 hover:text-black disabled:opacity-40"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              saving ||
              (!isSimple && reservedNumber > stockNumber)
            }
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#171512] px-5 text-[9px] font-bold uppercase tracking-[0.12em] text-white hover:bg-black disabled:opacity-40"
          >
            {saving ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving
              </>
            ) : (
              <>
                <Icon name="check" size={13} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min: number;
}) {
  return (
    <div>
      <label className="mb-2 block text-[8px] font-bold uppercase tracking-[0.17em] text-black/35">
        {label}
      </label>

      <input
        type="number"
        min={min}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-12 w-full rounded-2xl border border-black/[0.08] bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#cdb47b]"
      />
    </div>
  );
}