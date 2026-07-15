"use client";

import type { ServiceCenterSummary } from "@repo/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@repo/ui";
import { ServiceCenterForm } from "./service-center-form";

type ServiceCenterFormCardProps = {
  description: string;
  onCancel: () => void;
  onSaved: () => void;
  serviceCenter: ServiceCenterSummary | null;
  title: string;
};

export function ServiceCenterFormCard({
  description,
  onCancel,
  onSaved,
  serviceCenter,
  title,
}: ServiceCenterFormCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ServiceCenterForm
          onCancel={onCancel}
          onSaved={onSaved}
          serviceCenter={serviceCenter}
        />
      </CardContent>
    </Card>
  );
}

export function ServiceCenterFormSkeleton({
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
        <Skeleton className="h-16 w-full" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-5 sm:grid-cols-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
