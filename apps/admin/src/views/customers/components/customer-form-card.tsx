"use client";

import type { CustomerSummary } from "@repo/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@repo/ui";
import { CustomerForm } from "./customer-form";

type CustomerFormCardProps = {
  customer: CustomerSummary | null;
  description: string;
  onCancel: () => void;
  onSaved: () => void;
  title: string;
};

export function CustomerFormCard({
  customer,
  description,
  onCancel,
  onSaved,
  title,
}: CustomerFormCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <CustomerForm
          customer={customer}
          onCancel={onCancel}
          onSaved={onSaved}
        />
      </CardContent>
    </Card>
  );
}

export function CustomerFormSkeleton({
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
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-5 dark:border-slate-800">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}
