"use client";

import type { DealerResponse } from "@repo/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@repo/ui";
import { DealerForm } from "./dealer-form";

type DealerFormCardProps = {
  dealer: DealerResponse | null;
  description: string;
  isLoading?: boolean;
  onCancel: () => void;
  onSaved: (dealer?: DealerResponse) => void;
  title: string;
};

export function DealerFormCard({
  dealer,
  description,
  isLoading,
  onCancel,
  onSaved,
  title,
}: DealerFormCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton className="h-11 w-full" key={index} />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <DealerForm dealer={dealer} onCancel={onCancel} onSaved={onSaved} />
      </CardContent>
    </Card>
  );
}
