"use client";

import {
  useRef,
  useState,
  type ClipboardEvent,
  type ChangeEvent,
} from "react";
import { toast } from "sonner";

export type ProductImageFormData = {
  id?: string;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
  variant_id: string | null;
  cloudinary_public_id: string | null;
  image_type: string;
};

export type ProductImageVariantOption = {
  id?: string;
  sku?: string;
  flavor?: string;
  size?: string;
};

type ProductImagesProps = {
  images: ProductImageFormData[];
  variants: ProductImageVariantOption[];
  onChangeAction: (images: ProductImageFormData[]) => void;
  disabled?: boolean;
};

const EMPTY_IMAGE: ProductImageFormData = {
  image_url: "",
  alt_text: "",
  is_primary: false,
  sort_order: 0,
  variant_id: null,
  cloudinary_public_id: null,
  image_type: "gallery",
};

function getScopeId(variantId: string | null | undefined) {
  return variantId ?? "product";
}

export default function ProductImages({
  images,
  variants,
  onChangeAction,
  disabled = false,
}: ProductImagesProps) {
  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [expandedIds, setExpandedIds] =
    useState<Set<string>>(
      () => new Set()
    );

  const [uploadingIndex, setUploadingIndex] =
    useState<number | null>(null);

  function getImageKey(
    image: ProductImageFormData,
    index: number
  ) {
    return (
      image.id ??
      `product-image-${index}`
    );
  }

  function toggleImage(
    image: ProductImageFormData,
    index: number
  ) {
    const key = getImageKey(
      image,
      index
    );

    setExpandedIds((current) => {
      const next = new Set(current);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  }

  function addImage() {
    const newImage: ProductImageFormData = {
      ...EMPTY_IMAGE,
      id: crypto.randomUUID(),
      sort_order: images.length,
    };

    onChangeAction([
      ...images,
      newImage,
    ]);

    setExpandedIds((current) => {
      const next = new Set(current);
      next.add(newImage.id!);
      return next;
    });
  }

  function updateImage(
    index: number,
    field: keyof ProductImageFormData,
    value:
      | string
      | boolean
      | number
      | null
  ) {
    const nextImages =
      images.map(
        (image, imageIndex) =>
          imageIndex === index
            ? {
                ...image,
                [field]: value,
              }
            : image
      );

    onChangeAction(nextImages);
  }

  function removeImage(index: number) {
    const removedImage =
      images[index];

    if (!removedImage) return;

    const removedWasPrimary =
      removedImage.is_primary;

    const removedScope =
      getScopeId(
        removedImage.variant_id
      );

    const remaining =
      images.filter(
        (_, imageIndex) =>
          imageIndex !== index
      );

    /*
     * If the removed image was primary,
     * make the first remaining image
     * of the SAME scope primary.
     *
     * Other variant scopes are untouched.
     */
    let replacementAssigned =
      false;

    const nextImages =
      remaining.map(
        (image, imageIndex) => {
          const sameScope =
            getScopeId(
              image.variant_id
            ) === removedScope;

          let isPrimary =
            image.is_primary;

          if (
            removedWasPrimary &&
            sameScope
          ) {
            if (
              !replacementAssigned
            ) {
              isPrimary = true;
              replacementAssigned =
                true;
            } else {
              isPrimary = false;
            }
          }

          return {
            ...image,
            sort_order: imageIndex,
            is_primary: isPrimary,
          };
        }
      );

    onChangeAction(nextImages);

    const removedKey =
      getImageKey(
        removedImage,
        index
      );

    setExpandedIds((current) => {
      const next = new Set(current);
      next.delete(removedKey);
      return next;
    });

    toast.success("Image removed");
  }

  /*
   * IMPORTANT:
   *
   * Only images belonging to the SAME scope
   * are affected.
   *
   * Scope:
   *   null variant_id = product/common
   *   variant UUID     = that specific variant
   */
 function setPrimary(index: number) {
  const selectedImage = images[index];

  if (!selectedImage) return;

  const selectedScope = getScopeId(
    selectedImage.variant_id
  );

  const isCurrentlyPrimary =
    selectedImage.is_primary;

  const nextImages = images.map(
    (currentImage, imageIndex) => {
      const currentScope = getScopeId(
        currentImage.variant_id
      );

      if (currentScope !== selectedScope) {
        return currentImage;
      }

      // If the currently selected primary image
      // is clicked again, unselect it.
      if (
        isCurrentlyPrimary &&
        imageIndex === index
      ) {
        return {
          ...currentImage,
          is_primary: false,
        };
      }

      // Otherwise, make the clicked image primary
      // and remove primary from other images
      // in the same scope.
      return {
        ...currentImage,
        is_primary:
          imageIndex === index,
      };
    }
  );

  onChangeAction(nextImages);
}

  function moveImage(
    index: number,
    direction: "up" | "down"
  ) {
    const targetIndex =
      direction === "up"
        ? index - 1
        : index + 1;

    if (
      targetIndex < 0 ||
      targetIndex >= images.length
    ) {
      return;
    }

    const nextImages = [
      ...images,
    ];

    const current =
      nextImages[index];

    const target =
      nextImages[targetIndex];

    if (!current || !target)
      return;

    nextImages[index] = target;
    nextImages[targetIndex] =
      current;

    const reordered =
      nextImages.map(
        (image, imageIndex) => ({
          ...image,
          sort_order:
            imageIndex,
        })
      );

    onChangeAction(reordered);
  }

  function getVariantLabel(
    variant: ProductImageVariantOption
  ) {
    const parts = [
      variant.size?.trim(),
      variant.flavor?.trim(),
    ].filter(Boolean);

    if (parts.length > 0) {
      return parts.join(" • ");
    }

    if (variant.sku?.trim()) {
      return variant.sku.trim();
    }

    return "Variant";
  }

  async function uploadImage(
    file: File,
    index: number
  ) {
    if (
      disabled ||
      uploadingIndex !== null
    ) {
      return;
    }

    setUploadingIndex(index);

    try {
      const fileName =
        file.name?.toLowerCase() ||
        "";

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

      const currentImage =
        images[index];

      const generatedAlt =
        currentImage?.alt_text?.trim() ||
        file.name
          .replace(
            /\.[^/.]+$/,
            ""
          )
          .replace(
            /[-_]+/g,
            " "
          );

      const nextImages =
        images.map(
          (
            image,
            imageIndex
          ) =>
            imageIndex === index
              ? {
                  ...image,
                  image_url:
                    data.url!,
                  cloudinary_public_id:
                    data.publicId ??
                    null,
                  alt_text:
                    generatedAlt,
                }
              : image
        );

      onChangeAction(
        nextImages
      );

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
      setUploadingIndex(null);
    }
  }

  function handleFileSelect(
    event: ChangeEvent<HTMLInputElement>,
    index: number
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    void uploadImage(
      file,
      index
    );

    event.target.value = "";
  }

  function handlePaste(
    event: ClipboardEvent<HTMLDivElement>,
    index: number
  ) {
    if (
      disabled ||
      uploadingIndex !== null
    ) {
      return;
    }

    const items =
      event.clipboardData?.items;

    if (!items?.length) return;

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
          void uploadImage(
            file,
            index
          );
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

      const url =
        pastedText.trim();

      const nextImages =
        images.map(
          (
            image,
            imageIndex
          ) =>
            imageIndex === index
              ? {
                  ...image,
                  image_url:
                    url,
                  cloudinary_public_id:
                    null,
                }
              : image
        );

      onChangeAction(
        nextImages
      );

      toast.success(
        "Image URL added"
      );
    }
  }

  function openFilePicker(
    index: number
  ) {
    if (
      disabled ||
      uploadingIndex !== null ||
      !fileInputRef.current
    ) {
      return;
    }

    fileInputRef.current.setAttribute(
      "data-image-index",
      String(index)
    );

    fileInputRef.current.click();
  }

  return (
    <section className="rounded-2xl border border-black/[0.07] bg-white">
      <div className="flex flex-col gap-4 border-b border-black/[0.07] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9c8250]">
            Product Images
          </p>

          <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em]">
            Product gallery
          </h2>

          <p className="mt-1 max-w-2xl text-[10px] leading-5 text-black/40">
            Upload your images once and assign
            them to the product or any variant.
          </p>
        </div>

        <button
          type="button"
          onClick={addImage}
          disabled={
            disabled ||
            uploadingIndex !== null
          }
          className="inline-flex h-10 items-center justify-center rounded-full bg-[#171512] px-5 text-[10px] font-bold uppercase tracking-[0.12em] text-white transition hover:bg-[#292722] disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Add Image
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/jfif,image/png,image/webp,image/avif,image/gif"
        className="hidden"
        onChange={(event) => {
          const indexValue =
            fileInputRef.current?.getAttribute(
              "data-image-index"
            );

          const index =
            Number(indexValue);

          if (
            !Number.isNaN(index)
          ) {
            handleFileSelect(
              event,
              index
            );
          }
        }}
      />

      {images.length === 0 && (
        <div className="px-5 py-14 text-center sm:px-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5f2eb]">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
              />
              <circle
                cx="8.5"
                cy="8.5"
                r="1.5"
              />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>

          <h3 className="mt-4 text-sm font-semibold">
            No images added
          </h3>

          <p className="mx-auto mt-1 max-w-sm text-[10px] leading-5 text-black/40">
            Add your product images once.
            You can assign the same image
            to different variants later.
          </p>

          <button
            type="button"
            onClick={addImage}
            disabled={disabled}
            className="mt-5 rounded-full border border-black/10 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] transition hover:bg-[#f5f2eb] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add First Image
          </button>
        </div>
      )}

      {images.length > 0 && (
        <div className="divide-y divide-black/[0.07]">
          {images.map(
            (image, index) => {
              const imageKey =
                getImageKey(
                  image,
                  index
                );

              const expanded =
                expandedIds.has(
                  imageKey
                );

              const isUploading =
                uploadingIndex ===
                index;

              const assignedVariant =
                variants.find(
                  (variant) =>
                    variant.id ===
                    image.variant_id
                );

              return (
                <div
                  key={imageKey}
                >
                  <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-black/[0.07] bg-[#f5f2eb]">
                      {image.image_url ? (
                        <img
                          src={
                            image.image_url
                          }
                          alt={
                            image.alt_text ||
                            "Product image"
                          }
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                          />
                          <circle
                            cx="8.5"
                            cy="8.5"
                            r="1.5"
                          />
                          <path d="m21 15-5-5L5 21" />
                        </svg>
                      )}

                      {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        toggleImage(
                          image,
                          index
                        )
                      }
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-xs font-semibold">
                          {image.alt_text ||
                            `Product Image ${
                              index + 1
                            }`}
                        </p>

                        {image.is_primary && (
                          <span className="shrink-0 rounded-full bg-[#cdb47b]/20 px-2 py-0.5 text-[7px] font-bold uppercase tracking-[0.1em] text-[#806b42]">
                            Primary
                          </span>
                        )}

                        {image.variant_id && (
                          <span className="shrink-0 rounded-full bg-black/[0.05] px-2 py-0.5 text-[7px] font-semibold text-black/50">
                            {assignedVariant
                              ? getVariantLabel(
                                  assignedVariant
                                )
                              : "Variant"}
                          </span>
                        )}

                        {!image.variant_id && (
                          <span className="shrink-0 rounded-full bg-[#f5f2eb] px-2 py-0.5 text-[7px] font-semibold text-black/45">
                            Common
                          </span>
                        )}
                      </div>

                      <p className="mt-1 truncate text-[9px] text-black/35">
                        {isUploading
                          ? "Uploading to Cloudinary..."
                          : image.image_url ||
                            "No image added"}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        moveImage(
                          index,
                          "up"
                        )
                      }
                      disabled={
                        disabled ||
                        uploadingIndex !==
                          null ||
                        index === 0
                      }
                      className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-black/10 text-xs transition hover:bg-[#f5f2eb] disabled:cursor-not-allowed disabled:opacity-30 sm:flex"
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        moveImage(
                          index,
                          "down"
                        )
                      }
                      disabled={
                        disabled ||
                        uploadingIndex !==
                          null ||
                        index ===
                          images.length - 1
                      }
                      className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-black/10 text-xs transition hover:bg-[#f5f2eb] disabled:cursor-not-allowed disabled:opacity-30 sm:flex"
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        removeImage(
                          index
                        )
                      }
                      disabled={
                        disabled ||
                        uploadingIndex !==
                          null
                      }
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-200 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6l-1 15H6L5 6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </button>

                    <button
                      type="button"
                      aria-label={
                        expanded
                          ? "Collapse image"
                          : "Expand image"
                      }
                      aria-expanded={
                        expanded
                      }
                      onClick={() =>
                        toggleImage(
                          image,
                          index
                        )
                      }
                      disabled={disabled}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white transition hover:bg-[#f5f2eb] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <svg
                        className={`transition-transform ${
                          expanded
                            ? "rotate-180"
                            : ""
                        }`}
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                  </div>

                  {expanded && (
                    <div className="border-t border-black/[0.05] bg-[#faf9f6] px-5 py-5 sm:px-6">
                      <div className="space-y-5">
                        <div>
                          <label
                            htmlFor={`image-${index}-variant`}
                            className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45"
                          >
                            Image Assignment
                          </label>

                          <select
                            id={`image-${index}-variant`}
                            value={
                              image.variant_id ??
                              ""
                            }
                            onChange={(
                              event
                            ) => {
                              const newVariantId =
                                event
                                  .target
                                  .value ||
                                null;

                              const previousScope =
                                getScopeId(
                                  image.variant_id
                                );

                              const newScope =
                                getScopeId(
                                  newVariantId
                                );

                              /*
                               * Moving to another scope:
                               * remove primary status.
                               *
                               * Existing primary
                               * in the destination scope
                               * remains untouched.
                               */
                              let nextImages =
                                images.map(
                                  (
                                    currentImage,
                                    imageIndex
                                  ) =>
                                    imageIndex ===
                                    index
                                      ? {
                                          ...currentImage,
                                          variant_id:
                                            newVariantId,
                                          is_primary:
                                            previousScope ===
                                            newScope
                                              ? currentImage.is_primary
                                              : false,
                                        }
                                      : currentImage
                                );

                              /*
                               * If this move somehow
                               * creates duplicate primary
                               * in the destination scope,
                               * keep the existing primary
                               * and make moved image
                               * non-primary.
                               */
                              if (
                                previousScope !==
                                  newScope &&
                                image.is_primary
                              ) {
                                const destinationHasPrimary =
                                  nextImages.some(
                                    (
                                      currentImage,
                                      imageIndex
                                    ) =>
                                      imageIndex !==
                                        index &&
                                      getScopeId(
                                        currentImage.variant_id
                                      ) ===
                                        newScope &&
                                      currentImage.is_primary
                                  );

                                if (
                                  destinationHasPrimary
                                ) {
                                  nextImages =
                                    nextImages.map(
                                      (
                                        currentImage,
                                        imageIndex
                                      ) =>
                                        imageIndex ===
                                        index
                                          ? {
                                              ...currentImage,
                                              is_primary:
                                                false,
                                            }
                                          : currentImage
                                    );
                                }
                              }

                              onChangeAction(
                                nextImages
                              );
                            }}
                            disabled={
                              disabled ||
                              uploadingIndex !==
                                null
                            }
                            className="h-11 w-full rounded-xl border border-black/[0.1] bg-white px-3.5 text-xs outline-none transition focus:border-black/30 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">
                              Product / Common Image
                            </option>

                            {variants.map(
                              (
                                variant,
                                variantIndex
                              ) => {
                                if (
                                  !variant.id
                                ) {
                                  return null;
                                }

                                return (
                                  <option
                                    key={
                                      variant.id
                                    }
                                    value={
                                      variant.id
                                    }
                                  >
                                    {getVariantLabel(
                                      variant
                                    )}
                                    {" • "}
                                    {variant.sku ||
                                      `Variant ${
                                        variantIndex +
                                        1
                                      }`}
                                  </option>
                                );
                              }
                            )}
                          </select>

                          <p className="mt-1.5 text-[8px] leading-4 text-black/30">
                            Each product/common scope
                            and each variant can have
                            its own primary image.
                          </p>
                        </div>

                        <div>
                          <label className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45">
                            Upload Image
                          </label>

                          <div
                            tabIndex={0}
                            onPaste={(event) =>
                              handlePaste(
                                event,
                                index
                              )
                            }
                            onClick={() =>
                              openFilePicker(
                                index
                              )
                            }
                            role="button"
                            className="flex min-h-[150px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white px-5 py-7 text-center outline-none transition hover:border-[#cdb47b] hover:bg-[#fffdf8] focus:border-[#cdb47b] focus:ring-2 focus:ring-[#cdb47b]/20"
                          >
                            {isUploading ? (
                              <>
                                <div className="h-7 w-7 animate-spin rounded-full border-2 border-black/10 border-t-[#9c8250]" />

                                <span className="mt-3 text-[10px] font-semibold">
                                  Uploading...
                                </span>

                                <span className="mt-1 text-[8px] text-black/35">
                                  Sending image to
                                  Cloudinary
                                </span>
                              </>
                            ) : (
                              <>
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5f2eb]">
                                  <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M12 16V4" />
                                    <path d="m7 9 5-5 5 5" />
                                    <path d="M5 20h14" />
                                  </svg>
                                </div>

                                <span className="mt-3 text-[10px] font-semibold">
                                  Choose image
                                </span>

                                <span className="mt-1 text-[9px] font-medium text-[#9c8250]">
                                  Or press Ctrl + V
                                </span>

                                <span className="mt-1 text-[8px] text-black/35">
                                  JPG, PNG, WEBP,
                                  AVIF, GIF · Max
                                  10MB
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor={`image-${index}-url`}
                            className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45"
                          >
                            Image URL
                          </label>

                          <input
                            id={`image-${index}-url`}
                            type="url"
                            value={
                              image.image_url ??
                              ""
                            }
                            onChange={(
                              event
                            ) => {
                              const nextImages =
                                images.map(
                                  (
                                    currentImage,
                                    imageIndex
                                  ) =>
                                    imageIndex ===
                                    index
                                      ? {
                                          ...currentImage,
                                          image_url:
                                            event.target.value,
                                          cloudinary_public_id:
                                            null,
                                        }
                                      : currentImage
                                );

                              onChangeAction(
                                nextImages
                              );
                            }}
                            placeholder="https://res.cloudinary.com/..."
                            disabled={
                              disabled ||
                              uploadingIndex !==
                                null
                            }
                            className="h-11 w-full rounded-xl border border-black/[0.1] bg-white px-3.5 text-xs outline-none transition focus:border-black/30 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`image-${index}-alt`}
                            className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45"
                          >
                            Alt Text
                          </label>

                          <input
                            id={`image-${index}-alt`}
                            type="text"
                            value={
                              image.alt_text ??
                              ""
                            }
                            onChange={(
                              event
                            ) =>
                              updateImage(
                                index,
                                "alt_text",
                                event.target.value
                              )
                            }
                            placeholder="Dark Chocolate 1 KG front"
                            disabled={
                              disabled ||
                              uploadingIndex !==
                                null
                            }
                            className="h-11 w-full rounded-xl border border-black/[0.1] bg-white px-3.5 text-xs outline-none transition focus:border-black/30 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>

                        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-black/[0.1] bg-white px-3.5 py-3">
                          <input
                            type="checkbox"
                            checked={Boolean(
                              image.is_primary
                            )}
                            onChange={() =>
                              setPrimary(
                                index
                              )
                            }
                            disabled={
                              disabled ||
                              uploadingIndex !==
                                null
                            }
                            className="h-4 w-4 accent-[#171512]"
                          />

                          <span>
                            <span className="block text-xs font-semibold">
                              Primary Image
                            </span>

                            <span className="mt-0.5 block text-[8px] text-black/35">
                              Primary for this
                              product/common
                              scope or selected
                              variant.
                            </span>
                          </span>
                        </label>

                        <div>
                          <label
                            htmlFor={`image-${index}-sort`}
                            className="mb-2 block text-[9px] font-bold uppercase tracking-[0.15em] text-black/45"
                          >
                            Sort Order
                          </label>

                          <input
                            id={`image-${index}-sort`}
                            type="number"
                            min="0"
                            value={
                              Number.isFinite(
                                image.sort_order
                              )
                                ? image.sort_order
                                : 0
                            }
                            onChange={(
                              event
                            ) =>
                              updateImage(
                                index,
                                "sort_order",
                                Math.max(
                                  0,
                                  Number(
                                    event.target.value
                                  ) || 0
                                )
                              )
                            }
                            disabled={
                              disabled ||
                              uploadingIndex !==
                                null
                            }
                            className="h-11 w-full rounded-xl border border-black/[0.1] bg-white px-3.5 text-xs outline-none transition focus:border-black/30 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-black/[0.06] pt-4">
                        <button
                          type="button"
                          onClick={() =>
                            moveImage(
                              index,
                              "up"
                            )
                          }
                          disabled={
                            disabled ||
                            uploadingIndex !==
                              null ||
                            index === 0
                          }
                          className="rounded-xl border border-black/10 px-3 py-2 text-[8px] font-bold uppercase tracking-[0.1em] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          ↑ Move Up
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            moveImage(
                              index,
                              "down"
                            )
                          }
                          disabled={
                            disabled ||
                            uploadingIndex !==
                              null ||
                            index ===
                              images.length - 1
                          }
                          className="rounded-xl border border-black/10 px-3 py-2 text-[8px] font-bold uppercase tracking-[0.1em] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          ↓ Move Down
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setPrimary(
                              index
                            )
                          }
                          disabled={
                            disabled ||
                            uploadingIndex !==
                              null ||
                            image.is_primary
                          }
                          className="rounded-xl border border-[#cdb47b]/50 px-3 py-2 text-[8px] font-bold uppercase tracking-[0.1em] text-[#806b42] transition hover:bg-[#cdb47b]/10 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          {image.is_primary
                            ? "Primary Image"
                            : "Make Primary"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      )}

      {images.length > 0 && (
        <div className="flex items-center justify-between border-t border-black/[0.07] px-5 py-4 sm:px-6">
          <p className="text-[9px] text-black/40">
            {images.length}{" "}
            {images.length === 1
              ? "image"
              : "images"}{" "}
            added
          </p>

          <button
            type="button"
            onClick={addImage}
            disabled={
              disabled ||
              uploadingIndex !== null
            }
            className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#9c8250] hover:text-[#806b42] disabled:cursor-not-allowed disabled:opacity-40"
          >
            + Add another image
          </button>
        </div>
      )}
    </section>
  );
}