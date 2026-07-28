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
    "flex size-9 items-center justify-center rounded-full text-sm font-medium text-white shadow-xs transition-opacity",
    href
      ? "hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-premium-red focus-visible:ring-offset-2"
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
