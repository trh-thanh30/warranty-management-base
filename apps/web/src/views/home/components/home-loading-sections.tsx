import { Container } from "@/src/components/common/container";
import { Skeleton } from "@repo/ui/skeleton";

const skeletonClassName = "motion-reduce:animate-none";

export function HomeHeroSkeleton() {
  return (
    <section
      aria-hidden="true"
      className="relative aspect-[4/5] overflow-hidden bg-light-gray sm:aspect-auto sm:h-[calc(100dvh-84px)]"
    >
      <Skeleton className="absolute inset-0 rounded-none motion-reduce:animate-none" />
    </section>
  );
}

export function HomeProductsSkeleton() {
  return (
    <section aria-hidden="true" className="bg-surface-muted py-12 lg:py-16">
      <Container>
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <Skeleton className={`mx-auto h-4 w-28 ${skeletonClassName}`} />
          <Skeleton className={`mx-auto h-10 w-3/4 ${skeletonClassName}`} />
          <Skeleton className={`mx-auto h-4 w-full ${skeletonClassName}`} />
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              className="overflow-hidden rounded-md border border-border-gray bg-white"
              key={index}
            >
              <Skeleton
                className={`aspect-[16/9] w-full rounded-none ${skeletonClassName}`}
              />
              <div className="space-y-3 p-5">
                <Skeleton className={`h-5 w-4/5 ${skeletonClassName}`} />
                <Skeleton className={`h-4 w-full ${skeletonClassName}`} />
                <Skeleton className={`h-4 w-2/3 ${skeletonClassName}`} />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function HomeFaqSkeleton() {
  return (
    <section aria-hidden="true" className="w-full py-10 md:py-16">
      <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.35fr]">
        <div className="space-y-5">
          <Skeleton className={`h-4 w-24 ${skeletonClassName}`} />
          <Skeleton className={`h-12 w-4/5 ${skeletonClassName}`} />
          <Skeleton className={`h-5 w-full ${skeletonClassName}`} />
          <Skeleton className={`h-5 w-3/4 ${skeletonClassName}`} />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton
              className={`h-18 w-full ${skeletonClassName}`}
              key={index}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
