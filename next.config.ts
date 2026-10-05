import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sbvtfkkvijgpzpktmfnh.supabase.co",
        pathname: "/storage/v1/object/public/blog-images/**",
      },
      {
        protocol: "https",
        hostname: "sbvtfkkvijgpzpktmfnh.supabase.co",
        pathname: "/storage/v1/object/public/service-images/**",
      },
    ],
  },
};

export default nextConfig;
