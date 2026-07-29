import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Projects now live on the home page; keep old links working.
      { source: "/projects", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
