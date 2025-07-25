import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images:{
    remotePatterns:[
      {
        protocol: 'http', 
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**', 
      },
    ],
  }
};

export default nextConfig;
