import Image from "next/image";

const DEFAULT_SITE_LOGO_SRC = "/logo_2.png";

type SiteLogoProps = {
  alt: string;
  className: string;
  height: number;
  priority?: boolean;
  src?: string | null;
  width: number;
};

export function SiteLogo({
  alt,
  className,
  height,
  priority = false,
  src,
  width,
}: SiteLogoProps) {
  const configuredSrc = src?.trim();

  if (configuredSrc) {
    return (
      // The asset host is configured by the API at runtime, so it cannot be
      // enumerated safely in Next.js remotePatterns at build time.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={alt}
        className={className}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
        height={height}
        src={configuredSrc}
        width={width}
      />
    );
  }

  return (
    <Image
      alt={alt}
      className={className}
      height={height}
      priority={priority}
      src={DEFAULT_SITE_LOGO_SRC}
      width={width}
    />
  );
}
