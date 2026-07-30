"use client";

import { ImageOff } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";

type ProductCoverImageProps = {
  alt: string;
  className?: string;
  sizes: string;
  src: string | null;
};

export function ProductCoverImage(props: ProductCoverImageProps) {
  return (
    <ProductCoverImageSource
      key={props.src ?? "missing-product-cover"}
      {...props}
    />
  );
}

function ProductCoverImageSource({
  alt,
  className,
  sizes,
  src,
}: ProductCoverImageProps) {
  const t = useTranslations("ProductsPage");
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-muted px-4 text-center text-stone-gray">
        <ImageOff aria-hidden="true" className="size-7" />
        <span className="text-xs font-medium">
          {t("catalog.imageUnavailable")}
        </span>
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      fill
      onError={() => setHasError(true)}
      sizes={sizes}
      src={src}
    />
  );
}
