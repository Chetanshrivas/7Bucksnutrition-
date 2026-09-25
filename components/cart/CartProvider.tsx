"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  productSlug: string;
  productName: string;
  brand: string;

  /*
   * IMPORTANT
   *
   * Variable product:
   *   real product_variants.id
   *
   * Simple product:
   *   product.id is used as the stable cart key.
   *
   * We keep this as string for backward compatibility with
   * existing CartPage / checkout code.
   */
  variantId: string;

  /*
   * true  = this cart item belongs to product_variants
   * false = this cart item is a simple product
   *
   * Optional for backward compatibility with old localStorage
   * cart items. Old items are treated as variant items.
   */
  isVariant?: boolean;

  flavor?: string;
  size?: string;
  servings?: number;

  sku: string;
  price: number;
  compareAt?: number;
  image?: string;

  quantity: number;

  /*
   * Stock snapshot used by cart quantity controls.
   *
   * Variable product:
   *   inventory.stock_quantity for the selected variant
   *
   * Simple product:
   *   products.stock_quantity
   */
  stock: number;
};

type AddToCartItem = Omit<CartItem, "quantity">;

interface CartContextValue {
  items: CartItem[];
  cartCount: number;
  subtotal: number;

  addItem: (
    item: AddToCartItem,
    quantity?: number
  ) => void;

  removeItem: (
    variantId: string
  ) => void;

  updateQuantity: (
    variantId: string,
    quantity: number
  ) => void;

  clearCart: () => void;

  isInCart: (
    variantId: string
  ) => boolean;
}

const CartContext =
  createContext<CartContextValue | undefined>(
    undefined
  );

const STORAGE_KEY = "seven-bucks-cart";

/* =========================================================
   CART ITEM NORMALIZATION
========================================================= */

/*
 * Old cart items already saved in localStorage won't have
 * isVariant because that field didn't exist previously.
 *
 * To preserve existing carts and existing behavior:
 *
 *   undefined isVariant => true
 *
 * New simple products explicitly store:
 *
 *   isVariant: false
 */
function normalizeCartItem(
  item: CartItem
): CartItem {
  return {
    ...item,

    /*
     * Keep numeric values safe when old/localStorage data
     * contains unexpected values.
     */
    price: Math.max(
      0,
      Number(item.price ?? 0)
    ),

    compareAt:
      item.compareAt != null
        ? Math.max(
            0,
            Number(item.compareAt)
          )
        : undefined,

    quantity: Math.max(
      1,
      Number(item.quantity ?? 1)
    ),

    stock: Math.max(
      0,
      Number(item.stock ?? 0)
    ),

    /*
     * Existing carts don't have this property.
     * Treat them as variant items.
     */
    isVariant:
      item.isVariant !== false,
  };
}

/* =========================================================
   PROVIDER
========================================================= */

export default function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] =
    useState<CartItem[]>([]);

  const [hydrated, setHydrated] =
    useState(false);

  /* =======================================================
     LOAD CART FROM LOCAL STORAGE
  ======================================================= */

  useEffect(() => {
    try {
      const storedCart =
        window.localStorage.getItem(
          STORAGE_KEY
        );

      if (storedCart) {
        const parsedCart: unknown =
          JSON.parse(storedCart);

        if (Array.isArray(parsedCart)) {
          const normalizedCart =
            parsedCart
              .filter(
                (item): item is CartItem =>
                  Boolean(
                    item &&
                      typeof item ===
                        "object"
                  )
              )
              .map(
                (item) =>
                  normalizeCartItem(
                    item
                  )
              );

          setItems(normalizedCart);
        }
      }
    } catch {
      window.localStorage.removeItem(
        STORAGE_KEY
      );
    } finally {
      setHydrated(true);
    }
  }, []);

  /* =======================================================
     SAVE CART TO LOCAL STORAGE
  ======================================================= */

  useEffect(() => {
    if (!hydrated) return;

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items)
    );
  }, [items, hydrated]);

  /* =======================================================
     ADD ITEM
  ======================================================= */

  const addItem = useCallback(
    (
      item: AddToCartItem,
      quantity = 1
    ) => {
      /*
       * Never add an out-of-stock item.
       */
      if (
        !item ||
        item.stock <= 0
      ) {
        return;
      }

      const normalizedItem: AddToCartItem = {
        ...item,

        /*
         * New callers should explicitly tell us whether this
         * is a variant or simple product.
         *
         * If omitted, preserve old behavior and treat it as
         * a variant.
         */
        isVariant:
          item.isVariant !== false,

        price: Math.max(
          0,
          Number(item.price ?? 0)
        ),

        compareAt:
          item.compareAt != null
            ? Math.max(
                0,
                Number(item.compareAt)
              )
            : undefined,

        stock: Math.max(
          0,
          Number(item.stock ?? 0)
        ),
      };

      const safeQuantity = Math.min(
        Math.max(
          Number(quantity) || 1,
          1
        ),
        normalizedItem.stock
      );

      setItems(
        (currentItems) => {
          /*
           * Cart identity is still variantId.
           *
           * For simple products we pass product.id as variantId,
           * so each simple product gets its own stable cart key.
           */
          const existingItem =
            currentItems.find(
              (currentItem) =>
                currentItem.variantId ===
                normalizedItem.variantId
            );

          if (existingItem) {
            const existingStock =
              Math.max(
                0,
                Number(
                  existingItem.stock ??
                    normalizedItem.stock
                )
              );

            const latestStock =
              Math.max(
                existingStock,
                normalizedItem.stock
              );

            /*
             * Don't allow cart quantity to exceed
             * the latest known stock.
             */
            const nextQuantity =
              Math.min(
                existingItem.quantity +
                  safeQuantity,
                latestStock
              );

            return currentItems.map(
              (currentItem) => {
                if (
                  currentItem.variantId !==
                  normalizedItem.variantId
                ) {
                  return currentItem;
                }

                return {
                  ...currentItem,

                  /*
                   * Refresh the stock snapshot and
                   * product information from the latest
                   * add-to-cart action.
                   */
                  ...normalizedItem,

                  quantity:
                    nextQuantity,
                };
              }
            );
          }

          return [
            ...currentItems,
            {
              ...normalizedItem,
              quantity: safeQuantity,
            },
          ];
        }
      );
    },
    []
  );

  /* =======================================================
     REMOVE ITEM
  ======================================================= */

  const removeItem = useCallback(
    (variantId: string) => {
      setItems(
        (currentItems) =>
          currentItems.filter(
            (item) =>
              item.variantId !==
              variantId
          )
      );
    },
    []
  );

  /* =======================================================
     UPDATE QUANTITY
  ======================================================= */

  const updateQuantity = useCallback(
    (
      variantId: string,
      quantity: number
    ) => {
      setItems(
        (currentItems) =>
          currentItems.map(
            (item) => {
              if (
                item.variantId !==
                variantId
              ) {
                return item;
              }

              /*
               * Existing behavior:
               * minimum = 1
               * maximum = item.stock
               */
              const safeStock =
                Math.max(
                  0,
                  Number(
                    item.stock ?? 0
                  )
                );

              /*
               * If stock is zero, don't create
               * an invalid quantity.
               */
              if (safeStock <= 0) {
                return {
                  ...item,
                  quantity: 1,
                };
              }

              return {
                ...item,
                quantity: Math.min(
                  Math.max(
                    Number(
                      quantity
                    ) || 1,
                    1
                  ),
                  safeStock
                ),
              };
            }
          )
      );
    },
    []
  );

  /* =======================================================
     CLEAR CART
  ======================================================= */

  const clearCart =
    useCallback(
      () => setItems([]),
      []
    );

  /* =======================================================
     IS IN CART
  ======================================================= */

  const isInCart = useCallback(
    (variantId: string) =>
      items.some(
        (item) =>
          item.variantId ===
          variantId
      ),
    [items]
  );

  /* =======================================================
     CART COUNT
  ======================================================= */

  const cartCount = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total + item.quantity,
        0
      ),
    [items]
  );

  /* =======================================================
     SUBTOTAL
  ======================================================= */

  const subtotal = useMemo(
    () =>
      items.reduce(
        (total, item) =>
          total +
          item.price *
            item.quantity,
        0
      ),
    [items]
  );

  /* =======================================================
     CONTEXT VALUE
  ======================================================= */

  const contextValue =
    useMemo(
      () => ({
        items,
        cartCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInCart,
      }),
      [
        items,
        cartCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isInCart,
      ]
    );

  return (
    <CartContext.Provider
      value={contextValue}
    >
      {children}
    </CartContext.Provider>
  );
}

/* =========================================================
   USE CART
========================================================= */

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}