import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    /**
     * Force Turbopack workspace root to this project to avoid picking up
     * parent-level lockfiles (C:\\Users\\hahuy\\package-lock.json).
     */
    root: __dirname,
  },
};

export default nextConfig;
