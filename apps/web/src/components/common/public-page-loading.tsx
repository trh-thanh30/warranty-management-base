"use client";

import { Container } from "@/src/components/common/container";
import { PublicNotFound } from "@/src/components/common/public-not-found";
import { routing, type AppLocale } from "@/src/i18n/routing";
import { Skeleton } from "@repo/ui/skeleton";
import { usePathname } from "next/navigation";

const dynamicSegmentPattern = /^\[[^/]+\]$/;
const localizedPathnames = routing.pathnames as Record<
  string,
  string | Record<AppLocale, string>
>;

function matchesPathnameTemplate(pathname: string, template: string) {
  const pathnameSegments = pathname.split("/").filter(Boolean);
  const templateSegments = template.split("/").filter(Boolean);

  return (
    pathnameSegments.length === templateSegments.length &&
    templateSegments.every(
      (segment, index) =>
        dynamicSegmentPattern.test(segment) ||
        segment === pathnameSegments[index],
    )
  );
}

export function isKnownPublicPathname(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const locale = routing.locales.find((candidate) => candidate === segments[0]);
  const routePathname = locale ? `/${segments.slice(1).join("/")}` : pathname;
  const normalizedPathname = routePathname === "" ? "/" : routePathname;

  return Object.entries(localizedPathnames).some(
    ([canonicalPathname, localizedPathname]) => {
      const template =
        locale && typeof localizedPathname !== "string"
          ? localizedPathname[locale]
          : canonicalPathname;

      return matchesPathnameTemplate(normalizedPathname, template);
    },
  );
}

export function PublicPageLoading() {
  const pathname = usePathname();

  if (!isKnownPublicPathname(pathname)) {
    return <PublicNotFound />;
  }

  return (
    <main
      aria-busy="true"
      className="min-h-[calc(100dvh-5rem)] bg-surface-muted"
    >
      <div aria-hidden="true">
        <Skeleton className="h-64 w-full rounded-none bg-light-gray motion-reduce:animate-none sm:h-96" />

        <Container className="py-10 lg:py-16">
          <div className="mx-auto max-w-2xl space-y-3 text-center">
            <Skeleton className="mx-auto h-4 w-28 motion-reduce:animate-none" />
            <Skeleton className="mx-auto h-9 w-3/4 motion-reduce:animate-none" />
            <Skeleton className="mx-auto h-4 w-full motion-reduce:animate-none" />
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                className="space-y-4 rounded-md border border-border-gray bg-white p-5"
                key={index}
              >
                <Skeleton className="aspect-video w-full motion-reduce:animate-none" />
                <Skeleton className="h-5 w-3/4 motion-reduce:animate-none" />
                <Skeleton className="h-4 w-full motion-reduce:animate-none" />
              </div>
            ))}
          </div>
        </Container>
      </div>
    </main>
  );
}
