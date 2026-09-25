"use client";

import {
  ChangeEvent,
  ClipboardEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { supabase } from "../../../lib/supabase";

type Brand = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type BrandForm = {
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  website_url: string;
  is_featured: boolean;
  is_active: boolean;
  sort_order: string;
};

const EMPTY_FORM: BrandForm = {
  name: "",
  slug: "",
  description: "",
  logo_url: "",
  website_url: "",
  is_featured: false,
  is_active: true,
  sort_order: "0",
};

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function optionalValue(value: string) {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<BrandForm>(EMPTY_FORM);
  const [slugManuallyEdited, setSlugManuallyEdited] =
    useState(false);

  const [deleteTarget, setDeleteTarget] =
    useState<Brand | null>(null);

  const logoInputRef =
    useRef<HTMLInputElement | null>(null);

  // --------------------------------------------------
  // Load brands
  // --------------------------------------------------

  async function loadBrands() {
    setLoading(true);

    const { data, error } = await supabase
      .from("brands")
      .select(`
        id,
        name,
        slug,
        description,
        logo_url,
        website_url,
        is_featured,
        is_active,
        sort_order,
        created_at,
        updated_at
      `)
      .order("sort_order", {
        ascending: true,
      })
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Brands loading error:", error);

      toast.error("Could not load brands", {
        description: error.message,
      });

      setBrands([]);
      setLoading(false);
      return;
    }

    setBrands((data ?? []) as Brand[]);
    setLoading(false);
  }

  useEffect(() => {
    void loadBrands();
  }, []);

  // --------------------------------------------------
  // Open add form
  // --------------------------------------------------

  function openAddForm() {
    setEditingId(null);
    setSlugManuallyEdited(false);
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  }

  // --------------------------------------------------
  // Open edit form
  // --------------------------------------------------

  function openEditForm(brand: Brand) {
    setEditingId(brand.id);
    setSlugManuallyEdited(true);

    setForm({
      name: brand.name,
      slug: brand.slug,
      description: brand.description ?? "",
      logo_url: brand.logo_url ?? "",
      website_url: brand.website_url ?? "",
      is_featured: brand.is_featured,
      is_active: brand.is_active,
      sort_order: String(brand.sort_order ?? 0),
    });

    setShowForm(true);
  }

  // --------------------------------------------------
  // Close form
  // --------------------------------------------------

  function closeForm() {
    if (saving || uploadingLogo) return;

    setShowForm(false);
    setEditingId(null);
    setSlugManuallyEdited(false);
    setForm({ ...EMPTY_FORM });
  }

  // --------------------------------------------------
  // Auto generate slug
  // --------------------------------------------------

  useEffect(() => {
    if (editingId || slugManuallyEdited) {
      return;
    }

    const name = form.name.trim();

    if (!name) {
      setForm((current) => {
        if (current.slug === "") return current;

        return {
          ...current,
          slug: "",
        };
      });

      return;
    }

    const timer = window.setTimeout(() => {
      const generatedSlug = makeSlug(name);

      setForm((current) => {
        if (current.slug === generatedSlug) {
          return current;
        }

        return {
          ...current,
          slug: generatedSlug,
        };
      });
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    form.name,
    editingId,
    slugManuallyEdited,
  ]);

  // --------------------------------------------------
  // Upload logo
  // Uses existing /api/upload
  // --------------------------------------------------

  async function uploadLogo(file: File) {
    if (saving || uploadingLogo) return;

    setUploadingLogo(true);

    try {
      const fileName = file.name?.toLowerCase() ?? "";

      const isImage =
        file.type.startsWith("image/") ||
        /\.(jpg|jpeg|jfif|png|webp|avif|gif)$/i.test(
          fileName
        );

      if (!isImage) {
        throw new Error(
          "Please select a valid image file."
        );
      }

      if (file.size <= 0) {
        throw new Error(
          "The selected image is empty."
        );
      }

      const maxSize = 10 * 1024 * 1024;

      if (file.size > maxSize) {
        throw new Error(
          "Image must be smaller than 10MB."
        );
      }

      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      let data: {
        success?: boolean;
        url?: string;
        publicId?: string;
        error?: string;
      };

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Upload server returned an invalid response."
        );
      }

      if (
        !response.ok ||
        !data?.success ||
        !data?.url
      ) {
        throw new Error(
          data?.error ||
            "Image upload failed."
        );
      }

      setForm((current) => ({
        ...current,
        logo_url: data.url ?? "",
      }));

      toast.success("Logo uploaded");
    } catch (error) {
      console.error(
        "Brand logo upload error:",
        error
      );

      toast.error("Logo upload failed", {
        description:
          error instanceof Error
            ? error.message
            : "Image upload failed.",
      });
    } finally {
      setUploadingLogo(false);
    }
  }

  // --------------------------------------------------
  // File select
  // --------------------------------------------------

  function handleLogoFileSelect(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    void uploadLogo(file);

    // Allows selecting the same file again.
    event.target.value = "";
  }

  // --------------------------------------------------
  // Paste image with Ctrl + V
  // --------------------------------------------------

  function handleLogoPaste(
    event: ClipboardEvent<HTMLDivElement>
  ) {
    if (saving || uploadingLogo) {
      return;
    }

    const items = event.clipboardData?.items;

    if (!items?.length) {
      return;
    }

    for (const item of items) {
      if (
        item.kind === "file" &&
        item.type.startsWith("image/")
      ) {
        event.preventDefault();

        const file = item.getAsFile();

        if (file) {
          void uploadLogo(file);
        }

        return;
      }
    }
  }

  // --------------------------------------------------
  // Remove logo
  // --------------------------------------------------

  function removeLogo() {
    if (saving || uploadingLogo) return;

    setForm((current) => ({
      ...current,
      logo_url: "",
    }));

    toast.success("Logo removed", {
      description:
        "Save the brand to permanently remove the logo.",
    });
  }

  // --------------------------------------------------
  // Save brand
  // --------------------------------------------------

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving || uploadingLogo) {
      return;
    }

    const name = form.name.trim();

    const slug =
      form.slug.trim() ||
      makeSlug(name);

    if (!name) {
      toast.error(
        "Brand name is required."
      );
      return;
    }

    if (!slug) {
      toast.error(
        "Brand slug is required."
      );
      return;
    }

    const parsedSortOrder =
      Number.parseInt(
        form.sort_order.trim() || "0",
        10
      );

    const sortOrder =
      Number.isFinite(parsedSortOrder) &&
      parsedSortOrder >= 0
        ? parsedSortOrder
        : 0;

    setSaving(true);

    const brandPayload = {
      name,
      slug,
      description: optionalValue(
        form.description
      ),
      logo_url: optionalValue(
        form.logo_url
      ),
      website_url: optionalValue(
        form.website_url
      ),
      is_featured:
        form.is_featured,
      is_active:
        form.is_active,
      sort_order: sortOrder,
    };

    try {
      if (editingId) {
        const { error } =
          await supabase
            .from("brands")
            .update(brandPayload)
            .eq("id", editingId);

        if (error) {
          console.error(
            "Brand update error:",
            error
          );

          toast.error(
            "Failed to update brand",
            {
              description:
                error.message,
            }
          );

          return;
        }

        toast.success(
          "Brand updated successfully."
        );
      } else {
        const { error } =
          await supabase
            .from("brands")
            .insert(brandPayload);

        if (error) {
          console.error(
            "Brand insert error:",
            error
          );

          toast.error(
            "Failed to add brand",
            {
              description:
                error.message,
            }
          );

          return;
        }

        toast.success(
          "Brand added successfully."
        );
      }

      await loadBrands();

      setForm({ ...EMPTY_FORM });
      setEditingId(null);
      setSlugManuallyEdited(false);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------------------------
  // Delete
  // --------------------------------------------------

  function handleDelete(brand: Brand) {
    setDeleteTarget(brand);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    const target = deleteTarget;

    setDeleteTarget(null);

    const { error } = await supabase
      .from("brands")
      .delete()
      .eq("id", target.id);

    if (error) {
      console.error(
        "Brand delete error:",
        error
      );

      toast.error(
        "Failed to delete brand",
        {
          description:
            error.message,
        }
      );

      return;
    }

    setBrands((current) =>
      current.filter(
        (item) =>
          item.id !== target.id
      )
    );

    toast.success(
      "Brand deleted successfully."
    );
  }

  // --------------------------------------------------
  // Search
  // --------------------------------------------------

  const filteredBrands =
    brands.filter((brand) => {
      const query =
        search.toLowerCase().trim();

      if (!query) return true;

      return (
        brand.name
          .toLowerCase()
          .includes(query) ||
        brand.slug
          .toLowerCase()
          .includes(query) ||
        (brand.description ?? "")
          .toLowerCase()
          .includes(query)
      );
    });

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <>
      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 px-4 backdrop-blur-[2px]">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-black/[0.08] bg-white p-5 shadow-2xl sm:p-6"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
              <svg
                width="19"
                height="19"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="m19 6-1 15H6L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
            </div>

            <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.18em] text-red-500">
              Delete brand
            </p>

            <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em]">
              Delete “{deleteTarget.name}”?
            </h2>

            <p className="mt-2 text-xs leading-5 text-black/45">
              This action cannot be undone.
              Please confirm before continuing.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(null)
                }
                className="h-11 rounded-xl border border-black/10 px-5 text-[10px] font-bold uppercase tracking-[0.12em] text-black/55 transition hover:bg-black/[0.03]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="h-11 rounded-xl bg-red-600 px-5 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-red-700"
              >
                Delete brand
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="min-h-screen bg-[#f5f2eb] text-[#171512]">
        <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#9c8250]">
                Store Management
              </p>

              <h1 className="mt-1 text-3xl font-semibold tracking-[-0.05em]">
                Brands
              </h1>

              <p className="mt-2 text-xs text-black/40">
                Manage the supplement brands available across your store.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddForm}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#171512] px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#f5f2eb] transition hover:bg-black"
            >
              + Add Brand
            </button>
          </div>

          {/* Search */}
          <div className="mt-7 flex h-11 items-center rounded-xl border border-black/[0.08] bg-white px-4">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              className="mr-3 shrink-0 text-black/30"
            >
              <circle
                cx="11"
                cy="11"
                r="7"
              />
              <path d="m20 20-4-4" />
            </svg>

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search brands..."
              className="w-full bg-transparent text-xs outline-none placeholder:text-black/30"
            />
          </div>

          {/* Add / Edit Form */}
          {showForm && (
            <div className="mt-5 rounded-2xl border border-black/[0.07] bg-white p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9c8250]">
                    {editingId
                      ? "Edit Brand"
                      : "New Brand"}
                  </p>

                  <h2 className="mt-1 text-xl font-semibold tracking-[-0.04em]">
                    {editingId
                      ? "Update brand"
                      : "Add a new brand"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={
                    saving ||
                    uploadingLogo
                  }
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-black/45 transition hover:bg-black/[0.04] hover:text-black disabled:opacity-50"
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-6"
              >
                <div className="grid gap-5 md:grid-cols-2">

                  {/* Name */}
                  <div>
                    <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45">
                      Brand Name
                    </label>

                    <input
                      type="text"
                      value={form.name}
                      onChange={(event) => {
                        setForm(
                          (current) => ({
                            ...current,
                            name: event.target.value,
                          })
                        );
                      }}
                      placeholder="e.g. Optimum Nutrition"
                      className="h-12 w-full rounded-xl border border-black/[0.1] bg-[#faf9f6] px-4 text-sm outline-none transition focus:border-black/30"
                      required
                    />
                  </div>

                  {/* Slug */}
                  <div>
                    <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45">
                      Slug
                    </label>

                    <input
                      type="text"
                      value={form.slug}
                      onChange={(event) => {
                        setSlugManuallyEdited(true);

                        setForm(
                          (current) => ({
                            ...current,
                            slug: makeSlug(
                              event.target.value
                            ),
                          })
                        );
                      }}
                      placeholder="optimum-nutrition"
                      className="h-12 w-full rounded-xl border border-black/[0.1] bg-[#faf9f6] px-4 text-sm outline-none transition focus:border-black/30"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45">
                      Description
                      <span className="ml-1 font-normal text-black/25">
                        Optional
                      </span>
                    </label>

                    <textarea
                      value={form.description}
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,
                            description:
                              event.target.value,
                          })
                        )
                      }
                      placeholder="Short description about this brand..."
                      rows={4}
                      className="w-full resize-none rounded-xl border border-black/[0.1] bg-[#faf9f6] px-4 py-3 text-sm outline-none transition focus:border-black/30"
                    />
                  </div>

                  {/* Logo */}
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45">
                      Brand Logo
                      <span className="ml-1 font-normal text-black/25">
                        Optional
                      </span>
                    </label>

                    <div
                      onPaste={handleLogoPaste}
                      tabIndex={0}
                      className="rounded-xl border border-black/[0.1] bg-[#faf9f6] p-4 outline-none focus-within:border-black/30"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">

                        {/* Preview */}
                        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-black/[0.08] bg-white">
                          {form.logo_url ? (
                            <img
                              src={form.logo_url}
                              alt="Brand logo preview"
                              className="h-full w-full object-contain p-2"
                            />
                          ) : (
                            <span className="text-[8px] font-bold uppercase tracking-[0.12em] text-black/25">
                              No Logo
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">

                          <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            onChange={
                              handleLogoFileSelect
                            }
                            className="hidden"
                          />

                          <div className="flex flex-wrap gap-2">
                            {/* Upload */}
                            <button
                              type="button"
                              onClick={() =>
                                logoInputRef.current?.click()
                              }
                              disabled={
                                uploadingLogo ||
                                saving
                              }
                              className="inline-flex h-10 items-center rounded-xl bg-[#171512] px-4 text-[9px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {uploadingLogo
                                ? "Uploading..."
                                : "Upload Logo"}
                            </button>

                            {/* Remove */}
                            {form.logo_url && (
                              <button
                                type="button"
                                onClick={
                                  removeLogo
                                }
                                disabled={
                                  uploadingLogo ||
                                  saving
                                }
                                className="inline-flex h-10 items-center rounded-xl border border-red-200 bg-red-50 px-4 text-[9px] font-bold uppercase tracking-[0.12em] text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Remove Logo
                              </button>
                            )}
                          </div>

                          <p className="mt-2 text-[9px] leading-4 text-black/35">
                            Upload an image or paste
                            an image with{" "}
                            <strong className="text-black/50">
                              Ctrl + V
                            </strong>
                            .
                          </p>

                          <p className="mt-1 text-[9px] leading-4 text-black/30">
                            Existing logo can also be
                            removed before updating.
                          </p>
                        </div>
                      </div>

                      {/* Logo URL */}
                      <div className="mt-4">
                        <label className="mb-2 block text-[8px] font-bold uppercase tracking-[0.14em] text-black/35">
                          Logo URL
                        </label>

                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={
                              form.logo_url
                            }
                            onChange={(event) =>
                              setForm(
                                (current) => ({
                                  ...current,
                                  logo_url:
                                    event.target.value,
                                })
                              )
                            }
                            placeholder="Paste Cloudinary image URL here..."
                            className="h-11 w-full rounded-xl border border-black/[0.1] bg-white px-4 text-xs outline-none transition focus:border-black/30"
                          />

                          {form.logo_url && (
                            <button
                              type="button"
                              onClick={
                                removeLogo
                              }
                              disabled={
                                uploadingLogo ||
                                saving
                              }
                              className="shrink-0 rounded-xl border border-red-200 px-4 text-[8px] font-bold uppercase tracking-[0.1em] text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Website */}
                  <div>
                    <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45">
                      Website URL
                      <span className="ml-1 font-normal text-black/25">
                        Optional
                      </span>
                    </label>

                    <input
                      type="url"
                      value={
                        form.website_url
                      }
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,
                            website_url:
                              event.target.value,
                          })
                        )
                      }
                      placeholder="https://example.com"
                      className="h-12 w-full rounded-xl border border-black/[0.1] bg-[#faf9f6] px-4 text-sm outline-none transition focus:border-black/30"
                    />
                  </div>

                  {/* Sort */}
                  <div>
                    <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45">
                      Sort Order
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={
                        form.sort_order
                      }
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,
                            sort_order:
                              event.target.value,
                          })
                        )
                      }
                      placeholder="0"
                      className="h-12 w-full rounded-xl border border-black/[0.1] bg-[#faf9f6] px-4 text-sm outline-none transition focus:border-black/30"
                    />
                  </div>
                </div>

                {/* Controls */}
                <div className="mt-5 grid gap-3 sm:grid-cols-2">

                  {/* Active */}
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-black/[0.08] bg-[#faf9f6] px-4 py-3">
                    <input
                      type="checkbox"
                      checked={
                        form.is_active
                      }
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,
                            is_active:
                              event.target.checked,
                          })
                        )
                      }
                      className="h-4 w-4 accent-[#171512]"
                    />

                    <span>
                      <span className="block text-xs font-semibold">
                        Active Brand
                      </span>

                      <span className="block text-[9px] text-black/40">
                        Available in the store.
                      </span>
                    </span>
                  </label>

                  {/* Featured */}
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-black/[0.08] bg-[#faf9f6] px-4 py-3">
                    <input
                      type="checkbox"
                      checked={
                        form.is_featured
                      }
                      onChange={(event) =>
                        setForm(
                          (current) => ({
                            ...current,
                            is_featured:
                              event.target.checked,
                          })
                        )
                      }
                      className="h-4 w-4 accent-[#171512]"
                    />

                    <span>
                      <span className="block text-xs font-semibold">
                        Featured Brand
                      </span>

                      <span className="block text-[9px] text-black/40">
                        Show this brand as featured.
                      </span>
                    </span>
                  </label>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={
                      saving ||
                      uploadingLogo
                    }
                    className="h-11 rounded-xl border border-black/10 px-5 text-[10px] font-bold uppercase tracking-[0.12em] text-black/55 transition hover:bg-black/[0.03] disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      saving ||
                      uploadingLogo
                    }
                    className="h-11 rounded-xl bg-[#171512] px-6 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Update Brand"
                        : "Create Brand"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Brands Table */}
          <div className="mt-5 overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-[#171512]" />

                  <p className="mt-4 text-xs text-black/40">
                    Loading brands...
                  </p>
                </div>
              </div>
            ) : filteredBrands.length === 0 ? (
              <div className="flex min-h-[300px] items-center justify-center px-6">
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f2eb] text-black/30">
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <path d="M12 3 14 5.2l3-.2.8 2.9 2.7 1.4-1.2 2.7 1.2 2.7-2.7 1.4-.8 2.9-3-.2L12 21l-2-2.2-3 .2-.8-2.9-2.7-1.4 1.2-2.7-1.2-2.7 2.7-1.4.8-2.9 3 .2L12 3Z" />
                    </svg>
                  </div>

                  <h2 className="mt-5 text-sm font-semibold">
                    {search
                      ? "No matching brands"
                      : "No brands yet"}
                  </h2>

                  <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-black/40">
                    {search
                      ? "Try another search term."
                      : "Add your first supplement brand to start building your catalog."}
                  </p>

                  {!search && (
                    <button
                      type="button"
                      onClick={
                        openAddForm
                      }
                      className="mt-5 inline-flex h-10 items-center rounded-xl bg-[#171512] px-5 text-[9px] font-bold uppercase tracking-[0.14em] text-white"
                    >
                      Add First Brand
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Desktop */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[950px]">
                    <thead>
                      <tr className="border-b border-black/[0.07] text-left">
                        <th className="px-6 py-4 text-[8px] font-bold uppercase tracking-[0.18em] text-black/35">
                          Brand
                        </th>

                        <th className="px-4 py-4 text-[8px] font-bold uppercase tracking-[0.18em] text-black/35">
                          Slug
                        </th>

                        <th className="px-4 py-4 text-[8px] font-bold uppercase tracking-[0.18em] text-black/35">
                          Sort
                        </th>

                        <th className="px-4 py-4 text-[8px] font-bold uppercase tracking-[0.18em] text-black/35">
                          Status
                        </th>

                        <th className="px-4 py-4 text-[8px] font-bold uppercase tracking-[0.18em] text-black/35">
                          Featured
                        </th>

                        <th className="px-6 py-4 text-right text-[8px] font-bold uppercase tracking-[0.18em] text-black/35">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredBrands.map(
                        (brand) => (
                          <tr
                            key={brand.id}
                            className="border-b border-black/[0.05] last:border-0"
                          >
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/[0.07] bg-[#faf9f6]">
                                  {brand.logo_url ? (
                                    <img
                                      src={
                                        brand.logo_url
                                      }
                                      alt={
                                        brand.name
                                      }
                                      className="h-full w-full object-contain p-1"
                                    />
                                  ) : (
                                    <span className="text-[7px] font-bold uppercase text-black/25">
                                      Logo
                                    </span>
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="text-xs font-semibold">
                                    {brand.name}
                                  </p>

                                  {brand.description && (
                                    <p className="mt-1 max-w-[280px] truncate text-[9px] text-black/35">
                                      {
                                        brand.description
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-5">
                              <code className="rounded-md bg-black/[0.04] px-2 py-1 text-[10px] text-black/50">
                                {brand.slug}
                              </code>
                            </td>

                            <td className="px-4 py-5">
                              <span className="text-xs font-semibold text-black/55">
                                {brand.sort_order}
                              </span>
                            </td>

                            <td className="px-4 py-5">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] ${
                                  brand.is_active
                                    ? "bg-green-100 text-green-700"
                                    : "bg-black/[0.06] text-black/40"
                                }`}
                              >
                                {brand.is_active
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </td>

                            <td className="px-4 py-5">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] ${
                                  brand.is_featured
                                    ? "bg-[#f3ead7] text-[#9c8250]"
                                    : "bg-black/[0.06] text-black/40"
                                }`}
                              >
                                {brand.is_featured
                                  ? "Featured"
                                  : "No"}
                              </span>
                            </td>

                            <td className="px-6 py-5">
                              <div className="flex items-center justify-end gap-4">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditForm(
                                      brand
                                    )
                                  }
                                  className="text-[9px] font-bold uppercase tracking-[0.12em] text-black/45 transition hover:text-black"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      brand
                                    )
                                  }
                                  className="text-[9px] font-bold uppercase tracking-[0.12em] text-red-500 transition hover:text-red-700"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="divide-y divide-black/[0.06] lg:hidden">
                  {filteredBrands.map(
                    (brand) => (
                      <div
                        key={brand.id}
                        className="p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-black/[0.07] bg-[#faf9f6]">
                              {brand.logo_url ? (
                                <img
                                  src={
                                    brand.logo_url
                                  }
                                  alt={
                                    brand.name
                                  }
                                  className="h-full w-full object-contain p-1"
                                />
                              ) : (
                                <span className="text-[7px] font-bold uppercase text-black/25">
                                  Logo
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-semibold">
                                {brand.name}
                              </p>

                              <code className="mt-2 inline-block rounded-md bg-black/[0.04] px-2 py-1 text-[9px] text-black/45">
                                {brand.slug}
                              </code>
                            </div>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[8px] font-bold uppercase ${
                              brand.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-black/[0.06] text-black/40"
                            }`}
                          >
                            {brand.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>

                        {brand.description && (
                          <p className="mt-4 text-xs leading-5 text-black/45">
                            {brand.description}
                          </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.08em] text-black/45">
                            Sort{" "}
                            {brand.sort_order}
                          </span>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.08em] ${
                              brand.is_featured
                                ? "bg-[#f3ead7] text-[#9c8250]"
                                : "bg-black/[0.04] text-black/40"
                            }`}
                          >
                            {brand.is_featured
                              ? "Featured"
                              : "Not Featured"}
                          </span>
                        </div>

                        <div className="mt-5 flex items-center justify-end gap-5">
                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(
                                brand
                              )
                            }
                            className="text-[9px] font-bold uppercase tracking-[0.12em] text-black/50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                brand
                              )
                            }
                            className="text-[9px] font-bold uppercase tracking-[0.12em] text-red-500"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </>
            )}
          </div>

          {/* Count */}
          {!loading &&
            brands.length > 0 && (
              <p className="mt-4 text-[9px] text-black/30">
                Showing{" "}
                {filteredBrands.length}{" "}
                of {brands.length} brands
              </p>
            )}
        </div>
      </main>
    </>
  );
}