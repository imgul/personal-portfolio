import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Canonical URLs and internal links use trailing slashes (/blog/, /blog/<slug>/).
  // Serve them directly instead of redirecting, so canonical == actual URL.
  trailingSlash: true,
};

export default nextConfig;
