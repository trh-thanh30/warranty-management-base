import type { IconType } from "react-icons";
import { cn } from "@repo/ui/lib/utils";

type FooterSocialLinkProps = {
  href: string;
  label: string;
  icon: IconType;
  className: string;
  iconClassName: string;
};

export function FooterSocialLink({
  href,
  label,
  icon: Icon,
  className,
  iconClassName,
}: FooterSocialLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "flex size-9 items-center justify-center rounded-full text-sm font-medium text-white shadow-xs transition-opacity hover:opacity-90",
        className,
      )}
      title={label}
      aria-label={label}
    >
      <Icon aria-hidden="true" className={iconClassName} />
    </a>
  );
}
