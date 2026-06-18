import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
    output: "standalone",
    turbopack: {
        /**
         * Force Turbopack workspace root to this project to avoid picking up
         * parent-level lockfiles (C:\\Users\\hahuy\\package-lock.json).
         */
        root: __dirname,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "api.dicebear.com",
            },
            {
                protocol: "https",
                hostname: "picsum.photos",
            },
            {
                protocol: "https",
                hostname: "cdn.jsdelivr.net",
            },
            // Cho phép mọi host ảnh khác (nội bộ/dev) để tránh lỗi unconfigured host.
            {
                protocol: "https",
                hostname: "**",
            },
            {
                protocol: "http",
                hostname: "**",
            },
        ],
    },
};

export default withNextIntl(nextConfig);
