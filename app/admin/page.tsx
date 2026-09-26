"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type DashboardOrder = {
  id: string;
  order_number: string | null;
  customer_name: string | null;
  customer_email: string | null;
  total_amount: number | null;
  currency: string | null;
  payment_status: string | null;
  order_status: string | null;
  created_at: string;
};

// A unified shape for stock aggregation — one row per variant (from the
// inventory table) or per standalone product (no variants, stock lives on
// the products table directly). Only the fields the stats math needs.
type StockRow = {
  stockQuantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
};

function Icon({
  name,
  size = 19,
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

  if (name === "box") {
    return (
      <svg {...common}>
        <path d="m21 8-9-5-9 5 9 5 9-5Z" />
        <path d="M3 8v8l9 5 9-5V8" />
        <path d="M12 13v8" />
      </svg>
    );
  }

  if (name === "layers") {
    return (
      <svg {...common}>
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 12 9 5 9-5" />
        <path d="m3 16 9 5 9-5" />
      </svg>
    );
  }

  if (name === "badge") {
    return (
      <svg {...common}>
        <path d="M12 3 14 5.2l3-.2.8 2.9 2.7 1.4-1.2 2.7 1.2 2.7-2.7 1.4-.8 2.9-3-.2L12 21l-2-2.2-3 .2-.8-2.9-2.7-1.4 1.2-2.7-1.2-2.7 2.7-1.4.8-2.9 3 .2L12 3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }

  if (name === "shopping") {
    return (
      <svg {...common}>
        <path d="M6 8h12l1 13H5L6 8Z" />
        <path d="M9 8a3 3 0 0 1 6 0" />
      </svg>
    );
  }

  if (name === "package") {
    return (
      <svg {...common}>
        <path d="m16.5 9.4-9-5.2" />
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="M3.3 7 12 12l8.7-5" />
        <path d="M12 22V12" />
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

  if (name === "arrow") {
    return (
      <svg {...common}>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    );
  }

  // FIX: the Revenue stat card asked for this icon but it never existed,
  // so that card silently rendered with no icon at all.
  if (name === "wallet") {
    return (
      <svg {...common}>
        <path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2" />
        <path d="M3 7v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
        <path d="M17 13a1.5 1.5 0 0 0 0 3h4v-3Z" />
      </svg>
    );
  }

  return null;
}

function formatMoney(
  amount: number,
  currency = "INR"
) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  } catch {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  }
}

function formatDate(date: string) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatStatus(value: string | null) {
  if (!value) return "Unknown";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusClass(status: string | null) {
  switch (status) {
    case "paid":
    case "delivered":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "cancelled":
    case "failed":
    case "returned":
      return "bg-red-50 text-red-600 border-red-200";

    case "shipped":
    case "out_for_delivery":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "confirmed":
    case "processing":
    case "packed":
      return "bg-[#f7f0df] text-[#856b32] border-[#e7d9b8]";

    default:
      return "bg-black/[0.035] text-black/50 border-black/10";
  }
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [revenue, setRevenue] = useState(0);

  const [recentOrders, setRecentOrders] = useState<
    DashboardOrder[]
  >([]);

  const [stockRows, setStockRows] = useState<
    StockRow[]
  >([]);

  const [inventoryAvailable, setInventoryAvailable] =
    useState(true);

  async function fetchDashboard(showRefresh = false) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      /*
       * PRODUCTS
       *
       * A sellable "product" here is either a variant (from
       * product_variants) or a standalone product that has its own
       * price and no variants at all — both need to count, otherwise
       * standalone items are invisible on this dashboard.
       */
      const variantCountResult = await supabase
        .from("product_variants")
        .select("id", { count: "exact", head: true });

      const variantLinksResult = await supabase
        .from("product_variants")
        .select("product_id");

      const standaloneProductsResult = await supabase
        .from("products")
        .select("id, stock_quantity")
        .not("price", "is", null);

      let variantCount = 0;
      let standaloneProducts: {
        id: string;
        stock_quantity: number;
      }[] = [];

      if (variantCountResult.error) {
        console.error(
          "Product count error:",
          variantCountResult.error
        );
      } else {
        variantCount = variantCountResult.count || 0;
      }

      if (
        !variantLinksResult.error &&
        !standaloneProductsResult.error
      ) {
        const productIdsWithVariants = new Set(
          (variantLinksResult.data || []).map(
            (row) => row.product_id as string
          )
        );

        standaloneProducts = (
          (standaloneProductsResult.data ||
            []) as {
            id: string;
            stock_quantity: number;
          }[]
        ).filter(
          (product) =>
            !productIdsWithVariants.has(product.id)
        );
      } else {
        if (variantLinksResult.error) {
          console.error(
            "Product-variant lookup error:",
            variantLinksResult.error
          );
        }

        if (standaloneProductsResult.error) {
          console.error(
            "Standalone product fetch error:",
            standaloneProductsResult.error
          );
        }
      }

      setProductCount(
        variantCount + standaloneProducts.length
      );

      /*
       * ORDERS
       */
      const ordersResult = await supabase
        .from("orders")
        .select(
          `
            id,
            order_number,
            customer_name,
            customer_email,
            total_amount,
            currency,
            payment_status,
            order_status,
            created_at
          `
        )
        .order("created_at", {
          ascending: false,
        });

      if (ordersResult.error) {
        console.error(
          "Orders fetch error:",
          ordersResult.error
        );

        setOrderCount(0);
        setRecentOrders([]);
      } else {
        const allOrders =
          (ordersResult.data || []) as DashboardOrder[];

        setOrderCount(allOrders.length);
        setRecentOrders(allOrders.slice(0, 5));

        /*
         * Revenue
         *
         * Count paid/delivered orders.
         * Cancelled/failed/refunded orders are ignored.
         */
        const calculatedRevenue = allOrders.reduce(
          (total, order) => {
            const isPaid =
              order.payment_status === "paid";

            const isDelivered =
              order.order_status === "delivered";

            if (!isPaid && !isDelivered) {
              return total;
            }

            return (
              total +
              Number(order.total_amount || 0)
            );
          },
          0
        );

        setRevenue(calculatedRevenue);
      }

      /*
       * CUSTOMERS
       *
       * If customers table is empty, count naturally becomes 0.
       */
      const customersResult = await supabase
        .from("customers")
        .select("id", { count: "exact", head: true });

      if (customersResult.error) {
        console.error(
          "Customer count error:",
          customersResult.error
        );

        setCustomerCount(0);
      } else {
        setCustomerCount(
          customersResult.count || 0
        );
      }

      /*
       * INVENTORY
       *
       * Merge variant-based inventory rows with standalone products'
       * own stock_quantity, so the stock overview reflects everything
       * that's actually sellable — not just variants.
       */
      const inventoryResult = await supabase
        .from("inventory")
        .select(
          `
            stock_quantity,
            reserved_quantity,
            low_stock_threshold
          `
        );

      if (
        inventoryResult.error &&
        standaloneProductsResult.error
      ) {
        console.error(
          "Inventory fetch error:",
          inventoryResult.error
        );

        setStockRows([]);
        setInventoryAvailable(false);
      } else {
        setInventoryAvailable(true);

        const variantStockRows: StockRow[] =
          inventoryResult.error
            ? []
            : (
                (inventoryResult.data || []) as {
                  stock_quantity: number;
                  reserved_quantity: number;
                  low_stock_threshold: number;
                }[]
              ).map((row) => ({
                stockQuantity: Number(
                  row.stock_quantity || 0
                ),
                reservedQuantity: Number(
                  row.reserved_quantity || 0
                ),
                lowStockThreshold: Number(
                  row.low_stock_threshold || 0
                ),
              }));

        // Standalone products have no reserved_quantity / low_stock_
        // threshold columns — nothing is reserved and there's no
        // low-stock line to draw for them, only in-stock/out-of-stock.
        const standaloneStockRows: StockRow[] =
          standaloneProducts.map((product) => ({
            stockQuantity: Number(
              product.stock_quantity || 0
            ),
            reservedQuantity: 0,
            lowStockThreshold: 0,
          }));

        setStockRows([
          ...variantStockRows,
          ...standaloneStockRows,
        ]);
      }
    } catch (error) {
      console.error(
        "Dashboard fetch error:",
        error
      );

      /*
       * If anything unexpectedly fails,
       * keep dashboard usable instead of crashing.
       */
      setProductCount(0);
      setOrderCount(0);
      setCustomerCount(0);
      setRevenue(0);
      setRecentOrders([]);
      setStockRows([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  const inventoryStats = useMemo(() => {
    let totalStock = 0;
    let reservedStock = 0;
    let lowStockItems = 0;
    let outOfStockItems = 0;

    stockRows.forEach((row) => {
      const available = Math.max(
        0,
        row.stockQuantity - row.reservedQuantity
      );

      totalStock += row.stockQuantity;
      reservedStock += row.reservedQuantity;

      if (available <= 0) {
        outOfStockItems += 1;
      } else if (available <= row.lowStockThreshold) {
        lowStockItems += 1;
      }
    });

    return {
      totalStock,
      reservedStock,
      availableStock: Math.max(
        0,
        totalStock - reservedStock
      ),
      lowStockItems,
      outOfStockItems,
    };
  }, [stockRows]);

  const stats = [
    {
      label: "Products",
      value: productCount,
      note: "Variants + standalone items",
      icon: "box",
    },
    {
      label: "Orders",
      value: orderCount,
      note: "Live orders",
      icon: "shopping",
    },
    {
      label: "Customers",
      value: customerCount,
      note: "Registered customers",
      icon: "badge",
    },
    {
      label: "Revenue",
      value: formatMoney(revenue),
      note: "Paid / delivered orders",
      icon: "wallet",
    },
  ];

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-[#171512]">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-black/30">
              Seven Bucks Nutrition
            </p>

            <h1 className="mt-1 text-3xl font-semibold tracking-[-0.05em]">
              Dashboard
            </h1>

            <p className="mt-2 text-[10px] text-black/35">
              Live store data from Supabase
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#171512] px-5 text-[9px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <Icon
              name="refresh"
              size={14}
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh Data"}
          </button>
        </div>

        {/* WELCOME */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#171512] via-[#1d1a15] to-[#171512] p-6 text-[#f5f2eb] shadow-[0_30px_80px_rgba(23,21,18,0.18)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#cdb47b]/10 blur-3xl" />

          <div className="relative max-w-2xl">
            <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#cdb47b]">
              Control Center
            </p>

            <h2 className="mt-3 break-words text-2xl font-semibold leading-[1.15] tracking-[-0.04em] sm:text-3xl lg:text-4xl">
              Everything your store needs, in one
              place.
            </h2>

            <p className="mt-4 max-w-xl text-xs leading-6 text-white/45 sm:text-sm">
              Manage products, variants, inventory,
              orders, customers and reviews from the
              Seven Bucks Nutrition control center.
            </p>
          </div>
        </section>

        {/* STATS */}
        <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group rounded-[22px] border border-black/[0.05] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(0,0,0,0.08)]"
            >
              <div className="flex items-start justify-between">
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/35">
                  {stat.label}
                </p>

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#f5f2eb] text-[#9c8250]">
                  <Icon
                    name={stat.icon}
                    size={14}
                  />
                </div>
              </div>

              {loading ? (
                <div className="mt-5 h-9 w-24 animate-pulse rounded-lg bg-black/[0.05]" />
              ) : (
                <p className="mt-4 truncate text-3xl font-semibold tracking-[-0.05em]">
                  {stat.value}
                </p>
              )}

              <p className="mt-2 text-[10px] text-black/35">
                {stat.note}
              </p>
            </div>
          ))}
        </section>

        {/* MAIN GRID */}
        <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_0.8fr] xl:gap-6">

          {/* RECENT ORDERS */}
          <div className="overflow-hidden rounded-[22px] border border-black/[0.05] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between border-b border-black/[0.07] px-5 py-5 sm:px-6">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9c8250]">
                  Orders
                </p>

                <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em]">
                  Recent orders
                </h3>
              </div>

              <Link
                href="/admin/orders"
                className="inline-flex shrink-0 items-center gap-1 text-[9px] font-bold uppercase tracking-[0.15em] text-black/45 transition hover:text-black"
              >
                View all
                <Icon
                  name="arrow"
                  size={12}
                />
              </Link>
            </div>

            {loading ? (
              <DashboardLoading />
            ) : recentOrders.length === 0 ? (
              <EmptyDashboardState
                icon="shopping"
                title="No orders yet"
                description="Live orders will appear here once customers start purchasing."
              />
            ) : (
              <div className="divide-y divide-black/[0.06]">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href="/admin/orders"
                    className="block px-5 py-4 transition hover:bg-[#faf9f6] sm:px-6"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold">
                          #
                          {order.order_number ||
                            order.id.slice(0, 8)}
                        </p>

                        <p className="mt-1 truncate text-[9px] text-black/40">
                          {order.customer_name ||
                            "Customer"}
                        </p>

                        <p className="mt-1 text-[8px] text-black/25">
                          {formatDate(
                            order.created_at
                          )}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-xs font-bold">
                          {formatMoney(
                            Number(
                              order.total_amount || 0
                            ),
                            order.currency ||
                              "INR"
                          )}
                        </p>

                        <span
                          className={`mt-2 inline-flex rounded-full border px-2 py-1 text-[7px] font-bold ${statusClass(
                            order.order_status
                          )}`}
                        >
                          {formatStatus(
                            order.order_status
                          )}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* INVENTORY */}
          <div className="overflow-hidden rounded-[22px] border border-black/[0.05] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between border-b border-black/[0.07] px-5 py-5 sm:px-6">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9c8250]">
                  Inventory
                </p>

                <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em]">
                  Stock overview
                </h3>
              </div>

              <Link
                href="/admin/inventory"
                className="shrink-0 text-[9px] font-bold uppercase tracking-[0.15em] text-black/40 hover:text-black"
              >
                Manage
              </Link>
            </div>

            {!inventoryAvailable ? (
              <EmptyDashboardState
                icon="package"
                title="Inventory unavailable"
                description="Inventory data could not be loaded right now."
              />
            ) : loading ? (
              <DashboardLoading />
            ) : stockRows.length === 0 ? (
              <EmptyDashboardState
                icon="package"
                title="No inventory yet"
                description="Add variant stock or a standalone product to start tracking inventory."
              />
            ) : (
              <div className="p-5 sm:p-6">
                <div className="grid grid-cols-2 gap-3">
                  <InventoryMetric
                    label="Total Stock"
                    value={
                      inventoryStats.totalStock
                    }
                  />

                  <InventoryMetric
                    label="Available"
                    value={
                      inventoryStats.availableStock
                    }
                  />

                  <InventoryMetric
                    label="Reserved"
                    value={
                      inventoryStats.reservedStock
                    }
                  />

                  <InventoryMetric
                    label="Low Stock"
                    value={
                      inventoryStats.lowStockItems
                    }
                    warning={
                      inventoryStats.lowStockItems >
                      0
                    }
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-[#faf9f6] px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-black/30">
                      Out of stock
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {
                        inventoryStats.outOfStockItems
                      }
                    </p>
                  </div>

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#9c8250]">
                    <Icon
                      name="package"
                      size={15}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="mt-6 rounded-[22px] border border-black/[0.05] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-6">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9c8250]">
              Quick Actions
            </p>

            <h3 className="mt-1 text-lg font-semibold tracking-[-0.03em]">
              Store management
            </h3>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <QuickAction
              href="/admin/products"
              icon="box"
              title="Manage Products"
              description="Add, edit and manage product variants."
            />

            <QuickAction
              href="/admin/categories"
              icon="layers"
              title="Manage Categories"
              description="Build your product category hierarchy."
            />

            <QuickAction
              href="/admin/brands"
              icon="badge"
              title="Manage Brands"
              description="Manage all trusted supplement brands."
            />

            <QuickAction
              href="/admin/orders"
              icon="shopping"
              title="Manage Orders"
              description="Update fulfilment and tracking details."
            />

          </div>
        </section>
      </div>
    </main>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-black/[0.07] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-black/15 hover:bg-[#faf9f6] hover:shadow-[0_10px_30px_rgba(23,21,18,0.06)]"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5f2eb] text-[#9c8250]">
        <Icon
          name={icon}
          size={16}
        />
      </div>

      <p className="mt-4 text-xs font-semibold">
        {title}
      </p>

      <p className="mt-1 text-[9px] leading-4 text-black/35">
        {description}
      </p>
    </Link>
  );
}

function InventoryMetric({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: number;
  warning?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        warning
          ? "border-[#e7d9b8] bg-[#faf6eb]"
          : "border-black/[0.06] bg-[#faf9f6]"
      }`}
    >
      <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-black/30">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-semibold tracking-[-0.04em] ${
          warning ? "text-[#856b32]" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="flex min-h-[230px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-[#171512]" />

        <p className="mt-4 text-[10px] font-semibold">
          Loading live data...
        </p>
      </div>
    </div>
  );
}

function EmptyDashboardState({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[230px] items-center justify-center px-6">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#f5f2eb] text-black/30">
          <Icon
            name={icon}
            size={19}
          />
        </div>

        <p className="mt-4 text-sm font-semibold">
          {title}
        </p>

        <p className="mt-1 max-w-xs text-[10px] leading-5 text-black/35">
          {description}
        </p>
      </div>
    </div>
  );
}