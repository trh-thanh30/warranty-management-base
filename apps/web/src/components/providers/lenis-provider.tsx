"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname } from "@/src/i18n/navigation";
import { useSearchParams } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

function LenisInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Smoothly scroll to top on route change OR searchParams change (category/filter/pagination)
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 1.2 });
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <LenisInner>{children}</LenisInner>
    </Suspense>
  );
}
