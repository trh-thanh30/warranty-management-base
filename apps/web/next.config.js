import createNextIntlPlugin from "next-intl/plugin";
import process from "node:process";
import { URL } from "node:url";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const assetCdnUrl = new URL(
  process.env.ASSET_CDN_URL ??
    "http://localhost:19000/warranty-management-base-public",
);
const assetPathname = assetCdnUrl.pathname.replace(/\/$/, "");
const isLocalAssetCdn = ["localhost", "127.0.0.1", "::1"].includes(
  assetCdnUrl.hostname,
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowLocalIP: isLocalAssetCdn,
    remotePatterns: [
      {
        hostname: assetCdnUrl.hostname,
        pathname: `${assetPathname}/**`,
        port: assetCdnUrl.port,
        protocol: assetCdnUrl.protocol.slice(0, -1),
      },
    ],
  },
  output: "standalone",
  transpilePackages: ["@repo/ui", "@repo/shared"],
};

export default withNextIntl(nextConfig);
