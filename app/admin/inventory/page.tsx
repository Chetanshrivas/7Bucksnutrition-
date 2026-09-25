"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

type InventoryItem = {
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

function getAvailableStock(item: InventoryItem) {
  return Math.max(
    0,
    Number(item.stock_quantity || 0) -
      Number(item.reserved_quantity || 0)
  );
}

function getStockStatus(item: InventoryItem): StockStatus {
  const available = getAvailableStock(item);

  if (available <= 0) return "out_of_stock";

  if (available <= Number(item.low_stock_threshold || 0)) {
    return "low_stock";
  }

  return "in_stock";
}

function formatVariant(item: InventoryItem) {
  const variant = item.variant;

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
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StockStatus>("all");

  const [editingItem, setEditingItem] =
    useState<InventoryItem | null>(null);

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

      const { data, error } = await supabase
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

      if (error) {
        console.error("Inventory fetch error:", error);
        alert(error.message);
        return;
      }

      setInventory((data || []) as unknown as InventoryItem[]);
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
    item: InventoryItem,
    amount: number
  ) {
    const currentStock = Number(item.stock_quantity || 0);
    const nextStock = Math.max(0, currentStock + amount);

    if (
      amount < 0 &&
      nextStock < Number(item.reserved_quantity || 0)
    ) {
      alert(
        "Stock cannot be lower than the currently reserved quantity."
      );
      return;
    }

    try {
      setUpdatingId(item.id);

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
        current.map((inventoryItem) =>
          inventoryItem.id === item.id
            ? {
                ...inventoryItem,
                stock_quantity: data.stock_quantity,
                updated_at: data.updated_at,
              }
            : inventoryItem
        )
      );
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
                stock_quantity: updated.stock_quantity,
                reserved_quantity:
                  updated.reserved_quantity,
                low_stock_threshold:
                  updated.low_stock_threshold,
                updated_at: updated.updated_at,
              }
            : item
        )
      );

      setEditingItem(null);
    } finally {
      setSaving(false);
    }
  }

  const filteredInventory = useMemo(() => {
    const query = search.trim().toLowerCase();

    return inventory.filter((item) => {
      const variant = item.variant;

      const searchableText = [
        variant?.product?.name,
        variant?.sku,
        variant?.flavor,
        variant?.size,
        variant?.barcode,
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
      totalUnits += Number(item.stock_quantity || 0);
      reservedUnits += Number(item.reserved_quantity || 0);
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
                thresholds for every product variant.
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
              {inventory.length} variants
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
                                {item.variant?.image_url ? (
                                  <img
                                    src={
                                      item.variant
                                        .image_url
                                    }
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
                                <p className="max-w-[250px] truncate text-xs font-semibold">
                                  {item.variant?.product
                                    ?.name ||
                                    "Unknown Product"}
                                </p>

                                <p className="mt-1 max-w-[280px] truncate text-[9px] text-black/40">
                                  {formatVariant(item)}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <span className="rounded-lg bg-[#f3f0e9] px-2.5 py-1.5 font-mono text-[8px] font-semibold text-black/55">
                              {item.variant?.sku ||
                                "—"}
                            </span>
                          </td>

                          <td className="px-5 py-5">
                            <p className="text-xs font-bold">
                              {formatMoney(
                                Number(
                                  item.variant?.price ||
                                    0
                                )
                              )}
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
                                  item.stock_quantity <=
                                    item.reserved_quantity
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-black/10 text-black/45 transition hover:bg-black hover:text-white disabled:opacity-30"
                              >
                                <Icon
                                  name="minus"
                                  size={12}
                                />
                              </button>

                              <span className="min-w-[38px] text-center text-sm font-bold">
                                {item.stock_quantity}
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
                              {item.reserved_quantity}
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
                                item.updated_at
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
                            {item.variant?.image_url ? (
                              <img
                                src={
                                  item.variant.image_url
                                }
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
                            <p className="truncate text-xs font-semibold">
                              {item.variant?.product
                                ?.name ||
                                "Unknown Product"}
                            </p>

                            <p className="mt-1 truncate text-[9px] text-black/40">
                              {formatVariant(item)}
                            </p>

                            <p className="mt-1 font-mono text-[8px] text-black/30">
                              {item.variant?.sku ||
                                "No SKU"}
                            </p>
                          </div>
                        </div>

                        <StockBadge status={status} />
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <MiniInfo
                          label="Stock"
                          value={String(
                            item.stock_quantity
                          )}
                        />

                        <MiniInfo
                          label="Available"
                          value={String(available)}
                        />

                        <MiniInfo
                          label="Reserved"
                          value={String(
                            item.reserved_quantity
                          )}
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
                            item.stock_quantity <=
                              item.reserved_quantity
                          }
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 disabled:opacity-30"
                        >
                          <Icon
                            name="minus"
                            size={14}
                          />
                        </button>

                        <div className="flex h-10 flex-1 items-center justify-center rounded-xl bg-[#faf9f6] text-xs font-bold">
                          {item.stock_quantity} units
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
            : "Create inventory records for your product variants to see them here."}
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
  item: InventoryItem;
  saving: boolean;
  onClose: () => void;
  onSave: (data: {
    stock_quantity: number;
    reserved_quantity: number;
    low_stock_threshold: number;
  }) => void;
}) {
  const [stock, setStock] = useState(
    String(item.stock_quantity)
  );

  const [reserved, setReserved] = useState(
    String(item.reserved_quantity)
  );

  const [threshold, setThreshold] = useState(
    String(item.low_stock_threshold)
  );

  const stockNumber = Number(stock || 0);
  const reservedNumber = Number(reserved || 0);

  const available = Math.max(
    0,
    stockNumber - reservedNumber
  );

  const status =
    available <= 0
      ? "out_of_stock"
      : available <= Number(threshold || 0)
      ? "low_stock"
      : "in_stock";

  function submit(event: React.FormEvent) {
    event.preventDefault();

    onSave({
      stock_quantity: Number(stock || 0),
      reserved_quantity: Number(reserved || 0),
      low_stock_threshold: Number(threshold || 0),
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
              {item.variant?.product?.name ||
                "Product"}
            </h2>

            <p className="mt-1 truncate text-[9px] text-black/40">
              {formatVariant(item)}
            </p>

            <p className="mt-1 font-mono text-[8px] text-black/30">
              {item.variant?.sku}
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

            <div className="mt-4 grid grid-cols-3 gap-2">
              <MiniInfo
                label="Stock"
                value={String(stockNumber)}
              />

              <MiniInfo
                label="Reserved"
                value={String(reservedNumber)}
              />

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
          </div>

          {reservedNumber > stockNumber && (
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
              reservedNumber > stockNumber
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