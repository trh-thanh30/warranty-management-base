"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { usePathname } from "@/src/i18n/navigation";
import { useSearchParams } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

type LenisScrollTo = Lenis["scrollTo"];

const LenisContext = createContext<{ scrollTo: LenisScrollTo }>({
  scrollTo(target, options) {
    if (typeof window === "undefined") return;

    const behavior = options?.immediate ? "auto" : "smooth";
    if (typeof target === "number") {
      window.scrollTo({ behavior, top: target });
      return;
    }

    const element =
      typeof target === "string" ? document.querySelector(target) : target;
    element?.scrollIntoView({ behavior, block: "start" });
  },
});

function LenisInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasHandledInitialRouteRef = useRef(false);
  const lenisRef = useRef<Lenis | null>(null);
  const scrollTo = useCallback<LenisScrollTo>((target, options) => {
    lenisRef.current?.scrollTo(target, options);
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Smoothly scroll to top on route change OR searchParams change (category/filter/pagination)
  useEffect(() => {
    if (!hasHandledInitialRouteRef.current) {
      hasHandledInitialRouteRef.current = true;
      return;
    }

    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 1.2 });
    }
  }, [pathname, searchParams]);

  return (
    <LenisContext.Provider value={{ scrollTo }}>
      {children}
    </LenisContext.Provider>
  );
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <LenisInner>{children}</LenisInner>
    </Suspense>
  );
}

export function useLenis() {
  return useContext(LenisContext);
}
