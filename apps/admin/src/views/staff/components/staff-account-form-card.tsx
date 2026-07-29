"use client";

import type { UserAccountSummary } from "@repo/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@repo/ui";
import { StaffAccountForm } from "./staff-account-form";

type StaffAccountFormCardProps = {
  description: string;
  onCancel: () => void;
  onSaved: (
    user: UserAccountSummary,
    created: boolean,
    temporaryPassword?: string,
  ) => void;
  title: string;
  user: UserAccountSummary | null;
};

export function StaffAccountFormCard({
  description,
  onCancel,
  onSaved,
  title,
  user,
}: StaffAccountFormCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <StaffAccountForm onCancel={onCancel} onSaved={onSaved} user={user} />
      </CardContent>
    </Card>
  );
}

export function StaffAccountFormSkeleton({
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
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-5 dark:border-slate-800">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}
