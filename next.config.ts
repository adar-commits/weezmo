import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "receipts.carpetshop.co.il",
        pathname: "/img/**",
      },
    ],
  },
};

export default nextConfig;
