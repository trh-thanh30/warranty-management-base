"use client";

import { Controller } from "react-hook-form";
import { ImagePlus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ProductResponse } from "@repo/shared";
import { Button } from "@repo/ui";
import { FormField as Field } from "@/src/components/common/form-field";
import { ImageUpload } from "@/src/components/common/image-upload";
import type { useProductForm } from "../hooks/use-product-form";

type ProductForm = ReturnType<typeof useProductForm>;

export function ProductMediaFields({
  disabled,
  form,
  product,
}: {
  disabled: boolean;
  form: ProductForm;
  product: ProductResponse | null;
}) {
  const t = useTranslations("Products");

  return (
    <aside
      aria-label={t("images")}
      className="min-w-0 space-y-5 xl:col-start-2"
    >
      <section className="min-w-0 rounded-md border border-slate-200 p-4 dark:border-slate-800">
        <Field id="product-cover" label={t("coverImage")}>
          <Controller
            control={form.control}
            name="coverImageUrl"
            render={({ field }) => (
              <ImageUpload
                disabled={disabled}
                id="product-cover"
                labels={{
                  hint: t("coverImageHint"),
                  previewAlt: t("coverImageAlt"),
                }}
                onAssetChange={(asset) =>
                  form.setValue("coverAssetId", asset?.id ?? "", {
                    shouldDirty: true,
                  })
                }
                onChange={field.onChange}
                persistedValue={
                  product?.assets.find((asset) => asset.role === "COVER")
                    ?.url ?? ""
                }
                uploadOptions={{ accessType: "PUBLIC", folder: "products" }}
                value={field.value}
              />
            )}
          />
        </Field>
      </section>

      <section className="min-w-0 space-y-4 overflow-hidden rounded-md border border-slate-200 p-4 dark:border-slate-800">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-medium">{t("galleryTitle")}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {t("galleryDescription")}
            </p>
          </div>
          <Button
            className="w-full sm:w-auto"
            disabled={disabled}
            onClick={() => form.gallery.append({ assetId: "", url: "" })}
            type="button"
            variant="secondary"
          >
            <ImagePlus aria-hidden="true" className="size-4" />
            {t("addGalleryImage")}
          </Button>
        </div>

        {form.gallery.fields.length === 0 ? (
          <p className="rounded-md border border-dashed p-5 text-center text-sm text-slate-500 dark:text-slate-400">
            {t("noGalleryImages")}
          </p>
        ) : (
          <div className="grid min-w-0 gap-4">
            {form.gallery.fields.map((galleryField, index) => (
              <div className="min-w-0 space-y-2" key={galleryField.id}>
                <Controller
                  control={form.control}
                  name={`galleryImages.${index}.url`}
                  render={({ field }) => (
                    <ImageUpload
                      compact
                      disabled={disabled}
                      id={`product-gallery-${galleryField.id}`}
                      onAssetChange={(asset) =>
                        form.setValue(
                          `galleryImages.${index}.assetId`,
                          asset?.id ?? "",
                          { shouldDirty: true },
                        )
                      }
                      onChange={field.onChange}
                      persistedValue={galleryField.url}
                      uploadOptions={{
                        accessType: "PUBLIC",
                        folder: "products",
                      }}
                      value={field.value}
                    />
                  )}
                />
                <Button
                  className="w-full"
                  disabled={disabled}
                  onClick={() => form.gallery.remove(index)}
                  type="button"
                  variant="secondary"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                  {t("removeGalleryImage")}
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </aside>
  );
}
