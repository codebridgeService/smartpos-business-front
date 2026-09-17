import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "api.smartpos.test",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.smartpos.test",
        pathname: "/**",
      },
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
