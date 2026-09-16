import type { IconType } from "react-icons";
import { cn } from "@repo/ui/lib/utils";

type FooterSocialLinkProps = {
  href?: string;
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
  const classes = cn(
    "flex size-11 items-center justify-center rounded-full border border-transparent text-sm font-medium text-white shadow-sm transition-colors",
    href
      ? "hover:border-white/40 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-2 focus-visible:ring-offset-deep-black"
      : "cursor-default",
    className,
  );
  const content = <Icon aria-hidden="true" className={iconClassName} />;

  if (!href) {
    return (
      <span aria-label={label} className={classes} title={label}>
        {content}
      </span>
    );
  }

  return (
    <a
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      className={classes}
      title={label}
      aria-label={label}
    >
      {content}
    </a>
  );
}
