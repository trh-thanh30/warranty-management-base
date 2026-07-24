import { Card, CardContent, Skeleton } from "@repo/ui";

export function StorageMonitoringSkeleton() {
  return (
    <div aria-busy="true" className="space-y-4">
      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-7 w-24" />
          </div>
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-3 w-full" />
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 p-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 p-6">
              <Skeleton className="size-10" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-7 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
