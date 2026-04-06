import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {
    /**
     * Force Turbopack workspace root to this project to avoid picking up
     * parent-level lockfiles (C:\\Users\\hahuy\\package-lock.json).
     */
    root: __dirname,
  },
};

export default withNextIntl(nextConfig);
