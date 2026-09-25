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

type Category = {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

type CategoryForm = {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
};

const EMPTY_FORM: CategoryForm = {
  name: "",
  slug: "",
  description: "",
  image_url: "",
  sort_order: 0,
  is_active: true,
};

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(
    null
  );

  /*
   * This is ONLY internal state.
   *
   * User never enters a parent ID.
   *
   * When user clicks:
   *
   * Protein -> Add Subcategory
   *
   * this becomes Protein's UUID automatically.
   */
  const [parentIdForForm, setParentIdForForm] = useState<
    string | null
  >(null);

  const [form, setForm] =
    useState<CategoryForm>(EMPTY_FORM);

  const [slugManuallyEdited, setSlugManuallyEdited] =
    useState(false);

  const [deleteTarget, setDeleteTarget] =
    useState<Category | null>(null);

  // ==================================================
  // LOAD CATEGORIES
  // ==================================================

  async function loadCategories() {
    setLoading(true);

    const { data, error } = await supabase
      .from("categories")
      .select(
        `
          id,
          parent_id,
          name,
          slug,
          description,
          image_url,
          sort_order,
          is_active,
          created_at
        `
      )
      .order("sort_order", {
        ascending: true,
      })
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Categories loading error:",
        error
      );

      toast.error("Could not load categories", {
        description: error.message,
      });

      setLoading(false);
      return;
    }

    setCategories(
      (data ?? []) as Category[]
    );

    setLoading(false);
  }

  useEffect(() => {
    void loadCategories();
  }, []);

  // ==================================================
  // RESET FORM
  // ==================================================

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setParentIdForForm(null);
    setSlugManuallyEdited(false);
    setShowForm(false);
  }

  // ==================================================
  // ADD MAIN CATEGORY
  // ==================================================

  function openAddCategoryForm() {
    setEditingId(null);

    /*
     * null = MAIN CATEGORY
     */
    setParentIdForForm(null);

    setSlugManuallyEdited(false);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  // ==================================================
  // ADD SUBCATEGORY
  // ==================================================

  function openAddSubcategoryForm(
    parent: Category
  ) {
    setEditingId(null);

    /*
     * Automatically store the parent's UUID.
     *
     * User does NOT have to enter this.
     */
    setParentIdForForm(parent.id);

    setSlugManuallyEdited(false);

    setForm({
      ...EMPTY_FORM,
      sort_order: 0,
    });

    setShowForm(true);
  }

  // ==================================================
  // EDIT CATEGORY
  // ==================================================

  function openEditForm(
    category: Category
  ) {
    setEditingId(category.id);

    /*
     * If this category is a subcategory,
     * automatically remember its parent.
     *
     * If parent_id is null, it's a main category.
     */
    setParentIdForForm(
      category.parent_id
    );

    /*
     * IMPORTANT:
     * Existing slug should be shown.
     *
     * If user changes the name,
     * slug automatically changes.
     *
     * If user manually changes slug,
     * automatic slug generation stops.
     */
    setSlugManuallyEdited(false);

    setForm({
      name: category.name,
      slug: category.slug,
      description:
        category.description ?? "",
      image_url:
        category.image_url ?? "",
      sort_order:
        category.sort_order ?? 0,
      is_active:
        category.is_active,
    });

    setShowForm(true);
  }

  // ==================================================
  // CLOSE
  // ==================================================

  function closeForm() {
    if (saving || uploading) {
      return;
    }

    resetForm();
  }

  // ==================================================
  // AUTO SLUG
  // ==================================================

  useEffect(() => {
    if (slugManuallyEdited) {
      return;
    }

    const name = form.name.trim();

    if (!name) {
      setForm((current) => {
        if (current.slug === "") {
          return current;
        }

        return {
          ...current,
          slug: "",
        };
      });

      return;
    }

    const timer =
      window.setTimeout(() => {
        const generatedSlug =
          makeSlug(name);

        setForm((current) => {
          if (
            current.slug ===
            generatedSlug
          ) {
            return current;
          }

          return {
            ...current,
            slug: generatedSlug,
          };
        });
      }, 200);

    return () =>
      window.clearTimeout(timer);
  }, [
    form.name,
    slugManuallyEdited,
  ]);

  // ==================================================
  // CLOUDINARY UPLOAD
  // ==================================================

  async function uploadImage(
    file: File
  ) {
    if (uploading) {
      return;
    }

    setUploading(true);

    try {
      const fileName =
        file.name?.toLowerCase() ?? "";

      const isImage =
        file.type.startsWith(
          "image/"
        ) ||
        /\.(jpg|jpeg|jfif|png|webp|avif|gif)$/i.test(
          fileName
        );

      if (!isImage) {
        throw new Error(
          "Please select a valid image file."
        );
      }

      const maxSize =
        10 * 1024 * 1024;

      if (file.size <= 0) {
        throw new Error(
          "The selected image is empty."
        );
      }

      if (file.size > maxSize) {
        throw new Error(
          "Image must be smaller than 10MB."
        );
      }

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      const response =
        await fetch(
          "/api/upload",
          {
            method: "POST",
            body: formData,
          }
        );

      let data: {
        success?: boolean;
        url?: string;
        publicId?: string;
        error?: string;
      };

      try {
        data =
          await response.json();
      } catch {
        throw new Error(
          "Upload server returned an invalid response."
        );
      }

      if (
        !response.ok ||
        !data?.success
      ) {
        throw new Error(
          data?.error ||
            "Image upload failed."
        );
      }

      if (!data.url) {
        throw new Error(
          "Cloudinary did not return an image URL."
        );
      }

      setForm((current) => ({
        ...current,
        image_url:
          data.url!,
      }));

      toast.success(
        "Image uploaded",
        {
          description:
            "Image uploaded to Cloudinary successfully.",
        }
      );
    } catch (error) {
      console.error(
        "Image upload error:",
        error
      );

      toast.error(
        "Image upload failed",
        {
          description:
            error instanceof Error
              ? error.message
              : "Image upload failed.",
        }
      );
    } finally {
      setUploading(false);
    }
  }

  // ==================================================
  // FILE SELECT
  // ==================================================

  function handleFileSelect(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    void uploadImage(file);

    event.target.value = "";
  }

  // ==================================================
  // PASTE IMAGE / URL
  // ==================================================

  function handlePaste(
    event: ClipboardEvent<HTMLDivElement>
  ) {
    if (
      uploading ||
      saving
    ) {
      return;
    }

    const items =
      event.clipboardData?.items;

    if (!items?.length) {
      return;
    }

    for (const item of items) {
      if (
        item.kind === "file" &&
        item.type.startsWith(
          "image/"
        )
      ) {
        event.preventDefault();

        const file =
          item.getAsFile();

        if (file) {
          void uploadImage(file);
        }

        return;
      }
    }

    const pastedText =
      event.clipboardData?.getData(
        "text"
      );

    if (
      pastedText &&
      /^https?:\/\/.+/i.test(
        pastedText.trim()
      )
    ) {
      event.preventDefault();

      setForm((current) => ({
        ...current,
        image_url:
          pastedText.trim(),
      }));

      toast.success(
        "Image URL added"
      );
    }
  }

  // ==================================================
  // SAVE
  // ==================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      saving ||
      uploading
    ) {
      return;
    }

    const name =
      form.name.trim();

    const slug =
      form.slug.trim() ||
      makeSlug(name);

    const description =
      form.description.trim();

    const image_url =
      form.image_url.trim();

    const sort_order =
      Number.isFinite(
        Number(form.sort_order)
      )
        ? Math.max(
            0,
            Math.floor(
              Number(
                form.sort_order
              )
            )
          )
        : 0;

    /*
     * THIS IS THE IMPORTANT PART.
     *
     * Main category:
     * parent_id = null
     *
     * Subcategory:
     * parent_id = selected parent's UUID
     */
    const parent_id =
      parentIdForForm;

    if (!name) {
      toast.error(
        "Category name is required."
      );
      return;
    }

    if (!slug) {
      toast.error(
        "Category slug is required."
      );
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        // ==================================================
        // UPDATE
        // ==================================================

        const {
          error: updateError,
        } = await supabase
          .from("categories")
          .update(
            parent_id
              ? {
                  // Subcategory: only save the fields that belong to a subcategory.
                  name,
                  slug,
                  sort_order,
                  is_active: form.is_active,
                  parent_id,
                }
              : {
                  // Main category: keep the existing full category functionality.
                  name,
                  slug,
                  description: description || null,
                  image_url: image_url || null,
                  sort_order,
                  is_active: form.is_active,
                  parent_id: null,
                }
          )
          .eq(
            "id",
            editingId
          );

        if (updateError) {
          console.error(
            updateError
          );

          toast.error(
            "Failed to update category",
            {
              description:
                updateError.message,
            }
          );

          return;
        }

        toast.success(
          "Category updated successfully."
        );
      } else {
        // ==================================================
        // INSERT
        // ==================================================

        const {
          error: insertError,
        } = await supabase
          .from("categories")
          .insert(
            parent_id
              ? {
                  // Subcategory: parent UUID is supplied automatically from the button clicked.
                  name,
                  slug,
                  sort_order,
                  is_active: form.is_active,
                  parent_id,
                }
              : {
                  // Main category.
                  name,
                  slug,
                  description: description || null,
                  image_url: image_url || null,
                  sort_order,
                  is_active: form.is_active,
                  parent_id: null,
                }
          );

        if (insertError) {
          console.error(
            insertError
          );

          toast.error(
            "Failed to add category",
            {
              description:
                insertError.message,
            }
          );

          return;
        }

        toast.success(
          parent_id
            ? "Subcategory added successfully."
            : "Category added successfully."
        );
      }

      await loadCategories();

      resetForm();
    } catch (error) {
      console.error(
        "Category save error:",
        error
      );

      toast.error(
        "Something went wrong",
        {
          description:
            error instanceof Error
              ? error.message
              : "Could not save category.",
        }
      );
    } finally {
      setSaving(false);
    }
  }

  // ==================================================
  // DELETE
  // ==================================================

  function handleDelete(
    category: Category
  ) {
    setDeleteTarget(category);
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    const target =
      deleteTarget;

    setDeleteTarget(null);

    /*
     * Don't allow deleting a main category
     * while it still has subcategories.
     */
    const hasChildren =
      categories.some(
        (category) =>
          category.parent_id ===
          target.id
      );

    if (hasChildren) {
      toast.error(
        "Cannot delete this category",
        {
          description:
            "Remove or delete its subcategories first.",
        }
      );

      return;
    }

    const {
      error: deleteError,
    } = await supabase
      .from("categories")
      .delete()
      .eq(
        "id",
        target.id
      );

    if (deleteError) {
      console.error(
        deleteError
      );

      toast.error(
        "Failed to delete category",
        {
          description:
            deleteError.message,
        }
      );

      return;
    }

    setCategories(
      (current) =>
        current.filter(
          (item) =>
            item.id !==
            target.id
        )
    );

    toast.success(
      "Category deleted successfully."
    );
  }

  // ==================================================
  // HELPERS
  // ==================================================

  const mainCategories =
    categories.filter(
      (category) =>
        category.parent_id ===
        null
    );

  function getChildren(
    parentId: string
  ) {
    return categories
      .filter(
        (category) =>
          category.parent_id ===
          parentId
      )
      .sort(
        (a, b) =>
          a.sort_order -
            b.sort_order ||
          a.name.localeCompare(
            b.name
          )
      );
  }

  function getParentName(
    category: Category
  ) {
    if (!category.parent_id) {
      return null;
    }

    return (
      categories.find(
        (item) =>
          item.id ===
          category.parent_id
      )?.name ?? null
    );
  }

  const query =
    search
      .toLowerCase()
      .trim();

  const visibleMainCategories =
    mainCategories.filter(
      (main) => {
        if (!query) {
          return true;
        }

        const mainMatches =
          main.name
            .toLowerCase()
            .includes(query) ||
          main.slug
            .toLowerCase()
            .includes(query);

        const childMatches =
          getChildren(
            main.id
          ).some(
            (child) =>
              child.name
                .toLowerCase()
                .includes(
                  query
                ) ||
              child.slug
                .toLowerCase()
                .includes(
                  query
                )
          );

        return (
          mainMatches ||
          childMatches
        );
      }
    );

  function getVisibleChildren(
    main: Category
  ) {
    const children =
      getChildren(main.id);

    if (!query) {
      return children;
    }

    const mainMatches =
      main.name
        .toLowerCase()
        .includes(query) ||
      main.slug
        .toLowerCase()
        .includes(query);

    if (mainMatches) {
      return children;
    }

    return children.filter(
      (child) =>
        child.name
          .toLowerCase()
          .includes(query) ||
        child.slug
          .toLowerCase()
          .includes(query)
    );
  }

  const editingCategory =
    editingId
      ? categories.find(
          (category) =>
            category.id ===
            editingId
        ) ?? null
      : null;

  const parentForForm =
    parentIdForForm
      ? categories.find(
          (category) =>
            category.id ===
            parentIdForForm
        ) ?? null
      : null;

  // ==================================================
  // UI
  // ==================================================

  return (
    <>
      {/* ==================================================
          DELETE MODAL
      ================================================== */}

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
              Delete category
            </p>

            <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em]">
              Delete “
              {deleteTarget.name}
              ”?
            </h2>

            <p className="mt-2 text-xs leading-5 text-black/45">
              This action cannot be
              undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setDeleteTarget(
                    null
                  )
                }
                className="h-11 rounded-xl border border-black/10 px-5 text-[10px] font-bold uppercase tracking-[0.12em] text-black/55 transition hover:bg-black/[0.03]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  confirmDelete
                }
                className="h-11 rounded-xl bg-red-600 px-5 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-red-700"
              >
                Delete category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          PAGE
      ================================================== */}

      <main className="min-h-screen bg-[#f5f2eb] text-[#171512]">
        <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

          {/* HEADER */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#9c8250]">
                Store Management
              </p>

              <h1 className="mt-1 text-3xl font-semibold tracking-[-0.05em]">
                Categories
              </h1>

              <p className="mt-2 text-xs text-black/40">
                Manage main categories
                and their
                subcategories.
              </p>
            </div>

            <button
              type="button"
              onClick={
                openAddCategoryForm
              }
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#171512] px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#f5f2eb] transition hover:bg-black"
            >
              + Add Category
            </button>
          </div>

          {/* SEARCH */}

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
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search categories..."
              className="w-full bg-transparent text-xs outline-none placeholder:text-black/30"
            />
          </div>

          {/* ==================================================
              ADD / EDIT FORM
          ================================================== */}

          {showForm && (
            <div className="mt-5 rounded-2xl border border-black/[0.07] bg-white p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9c8250]">
                    {editingId
                      ? parentForForm
                        ? "Edit Subcategory"
                        : "Edit Category"
                      : parentForForm
                        ? "New Subcategory"
                        : "New Category"}
                  </p>

                  <h2 className="mt-1 text-xl font-semibold tracking-[-0.04em]">
                    {editingId
                      ? parentForForm
                        ? `Update subcategory under ${parentForForm.name}`
                        : "Update category"
                      : parentForForm
                        ? `Add subcategory under ${parentForForm.name}`
                        : "Add a new main category"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-black/45 transition hover:bg-black/[0.04] hover:text-black"
                >
                  ×
                </button>
              </div>

              {parentForForm && (
                <div className="mt-5 rounded-xl border border-[#9c8250]/20 bg-[#9c8250]/[0.06] px-4 py-3">
                  <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#9c8250]">
                    Subcategory
                  </p>
                  <p className="mt-1 text-xs font-semibold">
                    {parentForForm.name}
                  </p>
                  <p className="mt-1 text-[9px] leading-5 text-black/40">
                    This subcategory will automatically be saved under {" "}
                    <strong>{parentForForm.name}</strong>.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6">
                {/* NAME + SLUG */}
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45">
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      placeholder={parentForForm ? "e.g. Whey Protein" : "e.g. Protein"}
                      className="h-12 w-full rounded-xl border border-black/[0.1] bg-[#faf9f6] px-4 text-sm outline-none transition focus:border-black/30"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(event) => {
                        setSlugManuallyEdited(true);
                        setForm((current) => ({
                          ...current,
                          slug: makeSlug(event.target.value),
                        }));
                      }}
                      placeholder={parentForForm ? "whey-protein" : "protein"}
                      className="h-12 w-full rounded-xl border border-black/[0.1] bg-[#faf9f6] px-4 text-sm outline-none transition focus:border-black/30"
                      required
                    />
                    <p className="mt-2 text-[9px] text-black/30">
                      Automatically generated from category name.
                    </p>
                  </div>
                </div>

                {/* MAIN CATEGORY ONLY */}
                {!parentForForm && (
                  <>
                    <div className="mt-5">
                      <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45">
                        Description <span className="font-normal text-black/25">(Optional)</span>
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            description: event.target.value,
                          }))
                        }
                        placeholder="Short description for this category..."
                        rows={4}
                        className="w-full resize-none rounded-xl border border-black/[0.1] bg-[#faf9f6] px-4 py-3 text-sm outline-none transition focus:border-black/30"
                      />
                    </div>

                    <div className="mt-5">
                      <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45">
                        Category Image <span className="font-normal text-black/25">(Optional)</span>
                      </label>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />

                      <div
                        tabIndex={0}
                        onPaste={handlePaste}
                        className="rounded-2xl border border-dashed border-black/15 bg-[#faf9f6] p-4 outline-none transition focus:border-black/30"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                          <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl border border-black/[0.07] bg-white">
                            {form.image_url ? (
                              <img
                                src={form.image_url}
                                alt={form.name || "Category"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center text-black/25">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <rect x="3" y="3" width="18" height="18" rx="2" />
                                  <circle cx="8.5" cy="8.5" r="1.5" />
                                  <path d="m21 15-5-5L5 21" />
                                </svg>
                                <span className="mt-2 text-[8px] font-bold uppercase tracking-[0.12em]">
                                  No Image
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold">Upload category image</p>
                            <p className="mt-1 text-[9px] leading-5 text-black/40">
                              Upload an image, paste an image, or enter an image URL.
                            </p>
                            <button
                              type="button"
                              disabled={uploading}
                              onClick={() => fileInputRef.current?.click()}
                              className="mt-3 inline-flex h-10 items-center rounded-xl bg-[#171512] px-4 text-[9px] font-bold uppercase tracking-[0.14em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {uploading ? "Uploading..." : "Choose Image"}
                            </button>
                          </div>
                        </div>

                        <div className="mt-4">
                          <label className="mb-2 block text-[8px] font-bold uppercase tracking-[0.15em] text-black/35">
                            Image URL
                          </label>
                          <input
                            type="url"
                            value={form.image_url}
                            onChange={(event) =>
                              setForm((current) => ({
                                ...current,
                                image_url: event.target.value,
                              }))
                            }
                            placeholder="https://..."
                            className="h-11 w-full rounded-xl border border-black/[0.1] bg-white px-4 text-xs outline-none transition focus:border-black/30"
                          />
                        </div>

                        {form.image_url && (
                          <button
                            type="button"
                            onClick={() =>
                              setForm((current) => ({
                                ...current,
                                image_url: "",
                              }))
                            }
                            className="mt-3 text-[8px] font-bold uppercase tracking-[0.14em] text-red-500 transition hover:text-red-700"
                          >
                            Remove Image
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* SORT ORDER */}
                <div className="mt-5">
                  <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.sort_order}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        sort_order: Number(event.target.value),
                      }))
                    }
                    className="h-12 w-full rounded-xl border border-black/[0.1] bg-[#faf9f6] px-4 text-sm outline-none transition focus:border-black/30"
                  />
                  <p className="mt-2 text-[9px] text-black/35">
                    Lower numbers appear first.
                  </p>
                </div>

                {/* ACTIVE */}
                <label className="mt-5 flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        is_active: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 accent-[#171512]"
                  />
                  <span>
                    <span className="block text-xs font-semibold">Active {parentForForm ? "subcategory" : "category"}</span>
                    <span className="block text-[9px] text-black/40">
                      Active {parentForForm ? "subcategories" : "categories"} can be used in products.
                    </span>
                  </span>
                </label>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={saving || uploading}
                    className="h-11 rounded-xl border border-black/10 px-5 text-[10px] font-bold uppercase tracking-[0.12em] text-black/55 transition hover:bg-black/[0.03] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || uploading}
                    className="h-11 rounded-xl bg-[#171512] px-6 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                        ? parentForForm
                          ? "Update Subcategory"
                          : "Update Category"
                        : parentForForm
                          ? "Create Subcategory"
                          : "Create Category"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================================================
              CATEGORY LIST
          ================================================== */}

          <div className="mt-5 overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
            {loading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-[#171512]" />

                  <p className="mt-4 text-xs text-black/40">
                    Loading categories...
                  </p>
                </div>
              </div>
            ) : visibleMainCategories.length ===
              0 ? (
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
                      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
                      <path d="m3 12 9 5 9-5" />
                      <path d="m3 16 9 5 9-5" />
                    </svg>
                  </div>

                  <h2 className="mt-5 text-sm font-semibold">
                    {search
                      ? "No matching categories"
                      : "No categories yet"}
                  </h2>

                  <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-black/40">
                    {search
                      ? "Try another search term."
                      : "Add your first product category to start building your catalog."}
                  </p>

                  {!search && (
                    <button
                      type="button"
                      onClick={
                        openAddCategoryForm
                      }
                      className="mt-5 inline-flex h-10 items-center rounded-xl bg-[#171512] px-5 text-[9px] font-bold uppercase tracking-[0.14em] text-white"
                    >
                      Add First Category
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* DESKTOP */}

                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[1000px]">
                    <thead>
                      <tr className="border-b border-black/[0.07] text-left">
                        <th className="px-6 py-4 text-[8px] font-bold uppercase tracking-[0.18em] text-black/35">Category</th>
                        <th className="px-4 py-4 text-[8px] font-bold uppercase tracking-[0.18em] text-black/35">Slug</th>
                        <th className="px-4 py-4 text-[8px] font-bold uppercase tracking-[0.18em] text-black/35">Type</th>
                        <th className="px-4 py-4 text-[8px] font-bold uppercase tracking-[0.18em] text-black/35">Status</th>
                        <th className="px-6 py-4 text-right text-[8px] font-bold uppercase tracking-[0.18em] text-black/35">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {visibleMainCategories.flatMap((main) => {
                        const children = getVisibleChildren(main);

                        const mainRow = (
                          <tr key={`main-${main.id}`} className="border-b border-black/[0.05] bg-[#faf9f6]">
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-[#f5f2eb]">
                                  {main.image_url ? (
                                    <img src={main.image_url} alt={main.name} className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-[7px] font-bold uppercase text-black/25">No image</div>
                                  )}
                                </div>
                                <div>
                                  <p className="text-xs font-semibold">{main.name}</p>
                                  <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.12em] text-[#9c8250]">Main Category</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-5"><code className="rounded-md bg-black/[0.04] px-2 py-1 text-[10px] text-black/50">{main.slug}</code></td>
                            <td className="px-4 py-5"><span className="rounded-full bg-[#9c8250]/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-[#8a6e3f]">Main</span></td>
                            <td className="px-4 py-5">
                              <span className={`inline-flex rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] ${main.is_active ? "bg-green-100 text-green-700" : "bg-black/[0.06] text-black/40"}`}>
                                {main.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center justify-end gap-4">
                                <button type="button" onClick={() => openAddSubcategoryForm(main)} className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#9c8250] transition hover:text-black">+ Add Subcategory</button>
                                <button type="button" onClick={() => openEditForm(main)} className="text-[9px] font-bold uppercase tracking-[0.12em] text-black/45 transition hover:text-black">Edit</button>
                                <button type="button" onClick={() => handleDelete(main)} className="text-[9px] font-bold uppercase tracking-[0.12em] text-red-500 transition hover:text-red-700">Delete</button>
                              </div>
                            </td>
                          </tr>
                        );

                        const childRows = children.map((child) => (
                          <tr key={`child-${child.id}`} className="border-b border-black/[0.05] last:border-0">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3 pl-8">
                                <span className="text-black/20">↳</span>
                                <div>
                                  <p className="text-xs font-medium">{child.name}</p>
                                  <p className="mt-1 text-[8px] text-black/35">Under {main.name}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4"><code className="rounded-md bg-black/[0.04] px-2 py-1 text-[9px] text-black/45">{child.slug}</code></td>
                            <td className="px-4 py-4"><span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-black/45">Subcategory</span></td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] ${child.is_active ? "bg-green-100 text-green-700" : "bg-black/[0.06] text-black/40"}`}>
                                {child.is_active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-4">
                                <button type="button" onClick={() => openEditForm(child)} className="text-[9px] font-bold uppercase tracking-[0.12em] text-black/45 transition hover:text-black">Edit</button>
                                <button type="button" onClick={() => handleDelete(child)} className="text-[9px] font-bold uppercase tracking-[0.12em] text-red-500 transition hover:text-red-700">Delete</button>
                              </div>
                            </td>
                          </tr>
                        ));

                        return [mainRow, ...childRows];
                      })}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE */}

                <div className="divide-y divide-black/[0.06] lg:hidden">
                  {visibleMainCategories.map(
                    (main) => {
                      const children =
                        getVisibleChildren(
                          main
                        );

                      return (
                        <div
                          key={main.id}
                          className="p-5"
                        >
                          {/* MAIN */}

                          <div className="flex items-start gap-3">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#f5f2eb]">
                              {main.image_url ? (
                                <img
                                  src={
                                    main.image_url
                                  }
                                  alt={
                                    main.name
                                  }
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[7px] font-bold uppercase text-black/25">
                                  No image
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold">
                                    {
                                      main.name
                                    }
                                  </p>

                                  <code className="mt-2 inline-block rounded-md bg-black/[0.04] px-2 py-1 text-[9px] text-black/45">
                                    {
                                      main.slug
                                    }
                                  </code>
                                </div>

                                <span
                                  className={`shrink-0 rounded-full px-2.5 py-1 text-[8px] font-bold uppercase ${
                                    main.is_active
                                      ? "bg-green-100 text-green-700"
                                      : "bg-black/[0.06] text-black/40"
                                  }`}
                                >
                                  {main.is_active
                                    ? "Active"
                                    : "Inactive"}
                                </span>
                              </div>

                              <div className="mt-4 flex flex-wrap items-center gap-4">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openAddSubcategoryForm(
                                      main
                                    )
                                  }
                                  className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#9c8250]"
                                >
                                  + Add Subcategory
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditForm(
                                      main
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
                                      main
                                    )
                                  }
                                  className="text-[9px] font-bold uppercase tracking-[0.12em] text-red-500"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* CHILDREN */}

                          {children.length >
                            0 && (
                            <div className="mt-5 ml-5 space-y-3 border-l border-black/[0.08] pl-4">
                              {children.map(
                                (
                                  child
                                ) => (
                                  <div
                                    key={
                                      child.id
                                    }
                                    className="rounded-xl bg-[#faf9f6] p-3"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-white">
                                        {child.image_url ? (
                                          <img
                                            src={
                                              child.image_url
                                            }
                                            alt={
                                              child.name
                                            }
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          <div className="flex h-full w-full items-center justify-center text-[6px] font-bold uppercase text-black/25">
                                            No image
                                          </div>
                                        )}
                                      </div>

                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                          <div>
                                            <p className="text-xs font-semibold">
                                              {
                                                child.name
                                              }
                                            </p>

                                            <code className="mt-1 inline-block text-[8px] text-black/40">
                                              {
                                                child.slug
                                              }
                                            </code>
                                          </div>

                                          <span
                                            className={`shrink-0 rounded-full px-2 py-1 text-[7px] font-bold uppercase ${
                                              child.is_active
                                                ? "bg-green-100 text-green-700"
                                                : "bg-black/[0.06] text-black/40"
                                            }`}
                                          >
                                            {child.is_active
                                              ? "Active"
                                              : "Inactive"}
                                          </span>
                                        </div>

                                        <div className="mt-3 flex items-center gap-4">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              openEditForm(
                                                child
                                              )
                                            }
                                            className="text-[8px] font-bold uppercase tracking-[0.12em] text-black/50"
                                          >
                                            Edit
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleDelete(
                                                child
                                              )
                                            }
                                            className="text-[8px] font-bold uppercase tracking-[0.12em] text-red-500"
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </>
            )}
          </div>

          {!loading &&
            categories.length > 0 && (
              <p className="mt-4 text-[9px] text-black/30">
                Showing{" "}
                {categories.length}{" "}
                categories
              </p>
            )}
        </div>
      </main>
    </>
  );
}