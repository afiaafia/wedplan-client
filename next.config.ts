import type { NextConfig } from "next";

const configuredApiBackendUrl = process.env.API_INTERNAL_URL?.trim();
const fallbackApiBackendUrl =
  process.env.VERCEL === "1" && process.env.NODE_ENV === "production"
    ? null
    : process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:5000";
const apiBackendUrl =
  configuredApiBackendUrl || fallbackApiBackendUrl;

if (!apiBackendUrl) {
  throw new Error("API_INTERNAL_URL is required for production API rewrites");
}

let apiBackendOrigin: string;
try {
  const parsedApiBackendUrl = new URL(apiBackendUrl);
  if (
    !["http:", "https:"].includes(parsedApiBackendUrl.protocol) ||
    parsedApiBackendUrl.username ||
    parsedApiBackendUrl.password ||
    parsedApiBackendUrl.pathname !== "/" ||
    parsedApiBackendUrl.search ||
    parsedApiBackendUrl.hash
  ) {
    throw new Error();
  }
  apiBackendOrigin = parsedApiBackendUrl.origin;
} catch {
  throw new Error("API_INTERNAL_URL must be an HTTP(S) backend origin");
}

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiBackendOrigin}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
