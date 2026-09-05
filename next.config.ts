import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "smartpos-api.servicefixit.me",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.servicefixit.me",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
