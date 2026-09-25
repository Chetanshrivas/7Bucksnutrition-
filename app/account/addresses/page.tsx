"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { useAuth } from "../../../components/auth/AuthProvider";
import { supabase } from "../../../lib/supabase";

type Address = {
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

type FormState = {
  address_line_1: string;
  address_line_2: string;
  landmark: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  address_label: string;
  is_default: boolean;
};

const EMPTY_FORM: FormState = {
  address_line_1: "",
  address_line_2: "",
  landmark: "",
  city: "",
  state: "",
  postal_code: "",
  country: "India",
  address_label: "",
  is_default: false,
};

function MapPinIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </svg>
  );
}

export default function AddressesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    void loadAddresses(user.id);
  }, [user, authLoading, router]);

  async function loadAddresses(userId: string) {
    setLoading(true);

    const { data, error: loadError } = await supabase
      .from("customer_addresses")
      .select(
        "id,address_line_1,address_line_2,landmark,city,state,postal_code,country,address_label,is_default"
      )
      .eq("customer_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (loadError) {
      console.error("Failed to load addresses:", loadError);
      setAddresses([]);
    } else {
      setAddresses((data ?? []) as Address[]);
    }

    setLoading(false);
  }

  function openAddForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setFormOpen(true);
  }

  function openEditForm(address: Address) {
    setEditingId(address.id);
    setForm({
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || "",
      landmark: address.landmark || "",
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      address_label: address.address_label || "",
      is_default: address.is_default,
    });
    setError("");
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) return;

    const userId = user.id;

    setError("");

    if (
      !form.address_line_1.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.postal_code.trim()
    ) {
      setError("Please fill in address, city, state and postal code.");
      return;
    }

    setSaving(true);

    const payload = {
      address_line_1: form.address_line_1.trim(),
      address_line_2: form.address_line_2.trim() || null,
      landmark: form.landmark.trim() || null,
      city: form.city.trim(),
      state: form.state.trim(),
      postal_code: form.postal_code.trim(),
      country: form.country.trim() || "India",
      address_label: form.address_label.trim() || null,
      is_default: form.is_default,
    };

    if (form.is_default) {
      await supabase
        .from("customer_addresses")
        .update({ is_default: false })
        .eq("customer_id", userId);
    }

    if (editingId) {
      const { error: updateError } = await supabase
        .from("customer_addresses")
        .update(payload)
        .eq("id", editingId)
        .eq("customer_id", userId);

      if (updateError) {
        console.error("Failed to update address:", updateError);
        setError("We couldn't save this address. Please try again.");
        setSaving(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from("customer_addresses")
        .insert({ ...payload, customer_id: userId });

      if (insertError) {
        console.error("Failed to add address:", insertError);
        setError("We couldn't add this address. Please try again.");
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    closeForm();
    void loadAddresses(userId);
  }

  async function handleDelete(addressId: string) {
    if (!user) return;

    setDeletingId(addressId);

    const { error: deleteError } = await supabase
      .from("customer_addresses")
      .delete()
      .eq("id", addressId)
      .eq("customer_id", user.id);

    setDeletingId(null);

    if (deleteError) {
      console.error("Failed to delete address:", deleteError);
      return;
    }

    void loadAddresses(user.id);
  }

  async function handleSetDefault(addressId: string) {
    if (!user) return;

    const userId = user.id;

    await supabase
      .from("customer_addresses")
      .update({ is_default: false })
      .eq("customer_id", userId);

    await supabase
      .from("customer_addresses")
      .update({ is_default: true })
      .eq("id", addressId)
      .eq("customer_id", userId);

    void loadAddresses(userId);
  }

  if (authLoading || !user || loading) {
    return (
      <main className="min-h-screen bg-[#f5f2eb] px-5 pt-32 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="h-3 w-24 animate-pulse rounded-full bg-black/10" />
          <div className="mt-4 h-10 w-56 animate-pulse rounded-xl bg-black/10" />

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[1, 2].map((item) => (
              <div key={item} className="h-40 animate-pulse rounded-[24px] bg-white/60" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f2eb] px-5 pb-24 pt-28 text-[#171512] sm:px-8 sm:pt-32">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-black/35 transition hover:text-black"
        >
          ← Back to account
        </Link>

        <div className="relative mt-7 overflow-hidden rounded-[32px] border border-black/[0.06] bg-gradient-to-br from-[#171512] via-[#1d1a15] to-[#171512] px-6 py-8 text-white shadow-[0_30px_80px_rgba(23,21,18,0.25)] sm:px-9 sm:py-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full border border-[#cdb47b]/15" />

          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#cdb47b]">
                Delivery
              </p>

              <h1 className="mt-3 font-serif text-4xl italic tracking-[-0.02em] sm:text-5xl">
                Saved Addresses
              </h1>

              <p className="mt-4 max-w-lg text-sm leading-6 text-white/45">
                Manage the addresses we deliver your orders to.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#cdb47b] px-6 text-[9px] font-bold uppercase tracking-[0.16em] text-[#171512] transition hover:-translate-y-0.5 hover:bg-[#e0c78f]"
            >
              <PlusIcon />
              Add Address
            </button>
          </div>
        </div>

        {addresses.length === 0 ? (
          <div className="mt-8 flex flex-col items-center rounded-[28px] border border-dashed border-black/[0.12] bg-white/50 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#a27d37]/25 bg-[#a27d37]/10 text-[#a27d37]">
              <MapPinIcon />
            </div>

            <p className="mt-5 text-sm font-medium">No saved addresses yet.</p>

            <p className="mt-2 max-w-xs text-xs leading-5 text-black/40">
              Add a delivery address to speed up your checkout.
            </p>

            <button
              type="button"
              onClick={openAddForm}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-[#171512] px-6 text-[9px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-black"
            >
              <PlusIcon />
              Add your first address
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`rounded-[24px] border p-5 transition sm:p-6 ${
                  address.is_default
                    ? "border-[#cdb47b] bg-[#fffaf0] shadow-[0_12px_40px_rgba(162,125,55,0.12)]"
                    : "border-black/[0.08] bg-white hover:border-black/15"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#a27d37]/10 text-[#a27d37]">
                      <MapPinIcon />
                    </span>
                    <span className="text-xs font-semibold">
                      {address.address_label || "Delivery address"}
                    </span>

                    {address.is_default && (
                      <span className="rounded-full bg-[#cdb47b] px-2 py-1 text-[6px] font-bold uppercase tracking-[0.14em] text-[#171512]">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditForm(address)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-black/35 transition hover:bg-black/5 hover:text-black"
                      aria-label="Edit address"
                    >
                      <EditIcon />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(address.id)}
                      disabled={deletingId === address.id}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-black/35 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                      aria-label="Delete address"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>

                <p className="mt-4 text-xs leading-5 text-black/55">
                  {address.address_line_1}
                  {address.address_line_2 ? `, ${address.address_line_2}` : ""}
                  {address.landmark ? `, ${address.landmark}` : ""}
                  <br />
                  {address.city}, {address.state} {address.postal_code}
                  <br />
                  {address.country}
                </p>

                {!address.is_default && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(address.id)}
                    className="mt-4 text-[8px] font-bold uppercase tracking-[0.14em] text-[#a27d37] transition hover:text-[#806126]"
                  >
                    Set as default
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {formOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={closeForm}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white p-6 shadow-[0_30px_90px_rgba(0,0,0,0.3)] sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#a27d37]">
                  {editingId ? "Update" : "New"}
                </p>
                <h2 className="mt-1 font-serif text-2xl italic tracking-[-0.02em]">
                  {editingId ? "Edit address" : "Add new address"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                className="flex h-9 w-9 items-center justify-center rounded-full text-black/40 transition hover:bg-black/5 hover:text-black"
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6">
              <fieldset disabled={saving} className="grid gap-4 disabled:opacity-60">
                <div>
                  <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/40">
                    Label (optional)
                  </label>
                  <input
                    type="text"
                    value={form.address_label}
                    onChange={(event) => setForm({ ...form, address_label: event.target.value })}
                    placeholder="Home, Office, etc."
                    className="h-11 w-full rounded-xl border border-black/[0.08] bg-[#faf9f6] px-3.5 text-sm outline-none focus:border-[#a27d37]/50 focus:bg-white focus:ring-4 focus:ring-[#a27d37]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/40">
                    Address line 1
                  </label>
                  <input
                    type="text"
                    required
                    value={form.address_line_1}
                    onChange={(event) => setForm({ ...form, address_line_1: event.target.value })}
                    className="h-11 w-full rounded-xl border border-black/[0.08] bg-[#faf9f6] px-3.5 text-sm outline-none focus:border-[#a27d37]/50 focus:bg-white focus:ring-4 focus:ring-[#a27d37]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/40">
                    Address line 2 (optional)
                  </label>
                  <input
                    type="text"
                    value={form.address_line_2}
                    onChange={(event) => setForm({ ...form, address_line_2: event.target.value })}
                    className="h-11 w-full rounded-xl border border-black/[0.08] bg-[#faf9f6] px-3.5 text-sm outline-none focus:border-[#a27d37]/50 focus:bg-white focus:ring-4 focus:ring-[#a27d37]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/40">
                    Landmark (optional)
                  </label>
                  <input
                    type="text"
                    value={form.landmark}
                    onChange={(event) => setForm({ ...form, landmark: event.target.value })}
                    className="h-11 w-full rounded-xl border border-black/[0.08] bg-[#faf9f6] px-3.5 text-sm outline-none focus:border-[#a27d37]/50 focus:bg-white focus:ring-4 focus:ring-[#a27d37]/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/40">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={form.city}
                      onChange={(event) => setForm({ ...form, city: event.target.value })}
                      className="h-11 w-full rounded-xl border border-black/[0.08] bg-[#faf9f6] px-3.5 text-sm outline-none focus:border-[#a27d37]/50 focus:bg-white focus:ring-4 focus:ring-[#a27d37]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/40">
                      State
                    </label>
                    <input
                      type="text"
                      required
                      value={form.state}
                      onChange={(event) => setForm({ ...form, state: event.target.value })}
                      className="h-11 w-full rounded-xl border border-black/[0.08] bg-[#faf9f6] px-3.5 text-sm outline-none focus:border-[#a27d37]/50 focus:bg-white focus:ring-4 focus:ring-[#a27d37]/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/40">
                      Postal code
                    </label>
                    <input
                      type="text"
                      required
                      value={form.postal_code}
                      onChange={(event) => setForm({ ...form, postal_code: event.target.value })}
                      className="h-11 w-full rounded-xl border border-black/[0.08] bg-[#faf9f6] px-3.5 text-sm outline-none focus:border-[#a27d37]/50 focus:bg-white focus:ring-4 focus:ring-[#a27d37]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/40">
                      Country
                    </label>
                    <input
                      type="text"
                      required
                      value={form.country}
                      onChange={(event) => setForm({ ...form, country: event.target.value })}
                      className="h-11 w-full rounded-xl border border-black/[0.08] bg-[#faf9f6] px-3.5 text-sm outline-none focus:border-[#a27d37]/50 focus:bg-white focus:ring-4 focus:ring-[#a27d37]/10"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    checked={form.is_default}
                    onChange={(event) => setForm({ ...form, is_default: event.target.checked })}
                    className="h-4 w-4 rounded border-black/20 text-[#a27d37] focus:ring-[#a27d37]/30"
                  />
                  <span className="text-xs font-medium text-black/60">Set as default address</span>
                </label>
              </fieldset>

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">
                  {error}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={closeForm}
                  className="h-12 flex-1 rounded-full border border-black/10 text-[9px] font-bold uppercase tracking-[0.16em] text-black/60 transition hover:border-black/20 hover:text-black"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="h-12 flex-1 rounded-full bg-[#171512] text-[9px] font-bold uppercase tracking-[0.16em] text-white transition hover:bg-black disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingId ? "Save changes" : "Add address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}