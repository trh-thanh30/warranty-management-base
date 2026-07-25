"use client";

import type { ProductResponse, ProductTemplateSummary } from "@repo/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@repo/ui";
import { ProductForm } from "./product-form";

type ProductFormCardProps = {
  description: string;
  onCancel: () => void;
  onSaved: (product?: ProductResponse) => void;
  product: ProductResponse | null;
  createMode?: "from-template" | "independent";
  productTemplate?: ProductTemplateSummary | null;
  title: string;
};

export function ProductFormCard({
  description,
  onCancel,
  onSaved,
  product,
  createMode,
  productTemplate,
  title,
}: ProductFormCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ProductForm
          createMode={createMode}
          onCancel={onCancel}
          onSaved={onSaved}
          product={product}
          productTemplate={productTemplate}
        />
      </CardContent>
    </Card>
  );
}

export function ProductFormSkeleton({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-36 w-full" />
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-5 dark:border-slate-800">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}
