import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const isCafe24Export = process.env.CAFE24_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(basePath
    ? {
        basePath,
        assetPrefix: basePath,
      }
    : {}),
  ...(isCafe24Export
    ? {
        output: "export" as const,
        trailingSlash: true,
      }
    : {}),
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
};

export default nextConfig;
