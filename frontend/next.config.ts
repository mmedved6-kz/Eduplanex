import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images:{
    remotePatterns:[
      {hostname:"images.pexels.com"}
    ],
  }
};

export default nextConfig;
