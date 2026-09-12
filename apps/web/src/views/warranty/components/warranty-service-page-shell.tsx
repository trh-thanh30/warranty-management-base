import { Container } from "@/src/components/common/container";
import { WarrantyPolicyShortcut } from "@/src/components/common/warranty-policy-shortcut";
import { cn } from "@repo/ui/lib/utils";
import type { ReactNode } from "react";
import { WarrantyBackLink } from "./warranty-back-link";
import {
  WarrantyPageHero,
  type WarrantyPageHeroProps,
} from "./warranty-page-hero";

type WarrantyServicePageShellProps = {
  children: ReactNode;
  contentClassName?: string;
  hero: WarrantyPageHeroProps;
  mainClassName?: string;
};

export function WarrantyServicePageShell({
  children,
  contentClassName,
  hero,
  mainClassName,
}: WarrantyServicePageShellProps) {
  return (
    <main
      className={cn("min-h-screen bg-white text-deep-black", mainClassName)}
    >
      <WarrantyPageHero {...hero} />
      <Container
        className={cn("max-w-360 space-y-10 py-12 sm:py-20", contentClassName)}
      >
        <div className="border-b border-border-gray pb-6">
          <WarrantyBackLink />
        </div>
        {children}
        <WarrantyPolicyShortcut />
      </Container>
    </main>
  );
}
