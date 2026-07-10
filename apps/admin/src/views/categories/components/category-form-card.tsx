"use client";

import type { CategoryResponse } from "@repo/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@repo/ui";
import { CategoryForm } from "./category-form";

type CategoryFormCardProps = {
  category: CategoryResponse | null;
  description: string;
  onCancel: () => void;
  onSaved: () => void;
  title: string;
};

export function CategoryFormCard({
  category,
  description,
  onCancel,
  onSaved,
  title,
}: CategoryFormCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <CategoryForm
          category={category}
          onCancel={onCancel}
          onSaved={onSaved}
        />
      </CardContent>
    </Card>
  );
}

export function CategoryFormSkeleton({
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
        <div className="grid gap-5 sm:grid-cols-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-36 w-full" />
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-5 dark:border-slate-800">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}
