import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable Turbopack for Docker compatibility
  experimental: {
    turbo: false,
  },
};

export default nextConfig;
