"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useAuth } from "../auth/AuthProvider";
import { supabase } from "../../lib/supabase";

export type CustomerAddress = {
  id: string;
  address_line_1: string;
  address_line_2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  address_label: string | null;
  is_default: boolean;
};

type AddressSelectorProps = {
  value: string | null;
  onAddressChangeAction: (address: CustomerAddress) => void;
};

export default function AddressSelector({
  value,
  onAddressChangeAction,
}: AddressSelectorProps) {
  const { user, loading: authLoading } = useAuth();

  const [addresses, setAddresses] = useState<CustomerAddress[]>(
    []
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setAddresses([]);
      setLoading(false);
      return;
    }

    /*
     * Capture the ID before entering the async function.
     * This prevents TypeScript's "user is possibly null"
     * error inside the async closure.
     */
    const userId = user.id;

    let cancelled = false;

    async function loadAddresses() {
      setLoading(true);

      const { data, error } = await supabase
        .from("customer_addresses")
        .select(
          "id,address_line_1,address_line_2,landmark,city,state,postal_code,country,address_label,is_default"
        )
        .eq("customer_id", userId)
        .order("is_default", {
          ascending: false,
        })
        .order("created_at", {
          ascending: false,
        });

      if (cancelled) {
        return;
      }

      if (error) {
        console.error(
          "Error loading customer addresses:",
          error
        );

        setAddresses([]);
        setLoading(false);

        return;
      }

      const loadedAddresses =
        (data ?? []) as CustomerAddress[];

      setAddresses(loadedAddresses);
      setLoading(false);
    }

    loadAddresses();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  /*
   * Automatically select the default address
   * when nothing has been selected yet.
   */
  useEffect(() => {
    if (value) {
      return;
    }

    if (addresses.length === 0) {
      return;
    }

    const preferredAddress =
      addresses.find(
        (address) => address.is_default
      ) ?? addresses[0];

    /*
     * TYPE-SAFETY FIX:
     *
     * `.find()` always types as `CustomerAddress | undefined`,
     * even though we already know (from the length check above)
     * that addresses isn't empty. TypeScript can't infer that on
     * its own, so `preferredAddress` still carries `| undefined`.
     *
     * This guard removes the `undefined` from the type — after
     * this line, TypeScript knows preferredAddress is definitely
     * a CustomerAddress, so the call below type-checks cleanly.
     */
    if (!preferredAddress) {
      return;
    }

    onAddressChangeAction(preferredAddress);
  }, [
    addresses,
    value,
    onAddressChangeAction,
  ]);

  if (authLoading || loading) {
    return (
      <div className="space-y-3">
        <div className="h-24 animate-pulse rounded-2xl bg-black/[0.05]" />

        <div className="h-24 animate-pulse rounded-2xl bg-black/[0.05]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-black/[0.08] bg-white p-5">
        <p className="text-sm font-medium">
          Sign in to use saved addresses.
        </p>

        <Link
          href="/login"
          className="mt-4 inline-flex text-[9px] font-bold uppercase tracking-[0.15em] text-[#a27d37]"
        >
          Sign in →
        </Link>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-black/[0.12] bg-white p-6">
        <p className="text-sm font-medium">
          No saved addresses yet.
        </p>

        <p className="mt-2 text-xs leading-5 text-black/40">
          Add an address to your account and it will appear
          here.
        </p>

        <Link
          href="/account/addresses"
          className="mt-5 inline-flex h-10 items-center rounded-full bg-[#171512] px-5 text-[8px] font-bold uppercase tracking-[0.15em] text-white transition hover:bg-black"
        >
          Add address
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {addresses.map((address) => {
        const selected = value === address.id;

        return (
          <button
            key={address.id}
            type="button"
            onClick={() => onAddressChangeAction(address)}
            aria-pressed={selected}
            className={`w-full rounded-[22px] border p-5 text-left transition ${
              selected
                ? "border-[#cdb47b] bg-[#fffaf0] shadow-[0_12px_40px_rgba(0,0,0,0.05)]"
                : "border-black/[0.08] bg-white hover:border-black/15 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            }`}
          >
            <div className="flex items-start gap-4">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  selected
                    ? "border-[#a27d37]"
                    : "border-black/20"
                }`}
              >
                {selected && (
                  <span className="h-2.5 w-2.5 rounded-full bg-[#a27d37]" />
                )}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold">
                    {address.address_label ||
                      "Delivery address"}
                  </span>

                  {address.is_default && (
                    <span className="rounded-full bg-[#cdb47b] px-2 py-1 text-[6px] font-bold uppercase tracking-[0.14em] text-[#171512]">
                      Default
                    </span>
                  )}
                </div>

                <p className="mt-2 text-xs leading-5 text-black/50">
                  {address.address_line_1}

                  {address.address_line_2
                    ? `, ${address.address_line_2}`
                    : ""}

                  {address.landmark
                    ? `, ${address.landmark}`
                    : ""}

                  <br />

                  {address.city}, {address.state}{" "}
                  {address.postal_code}

                  <br />

                  {address.country}
                </p>
              </div>
            </div>
          </button>
        );
      })}

      <Link
        href="/account/addresses"
        className="inline-flex pt-2 text-[8px] font-bold uppercase tracking-[0.15em] text-[#a27d37] transition hover:text-[#806126]"
      >
        Manage saved addresses →
      </Link>
    </div>
  );
}