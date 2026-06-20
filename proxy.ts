import createMiddleware from "next-intl/middleware"
import type { NextRequest } from "next/server"

import { routing } from "./src/i18n/routing"

const intlMiddleware = createMiddleware(routing)

export function proxy(request: NextRequest) {
    const response = intlMiddleware(request)

    // When deployed behind the Cloudflare Tunnel, requests reach the app over
    // plain HTTP on an internal port (e.g. 3000/8080). next-intl builds ABSOLUTE
    // redirect URLs from that, leaking the internal port (https://tedo.vn:3000/vi).
    // If the edge terminated TLS (X-Forwarded-Proto: https), rewrite Location to
    // the canonical public origin: https scheme, no explicit port.
    const location = response.headers.get("location")
    if (location) {
        try {
            const url = new URL(location)
            const forwardedHost = (
                request.headers.get("x-forwarded-host") ||
                request.headers.get("host") ||
                url.host
            )
                .split(",")[0]
                .trim()
            const hostname = forwardedHost.replace(/:\d+$/, "")
            const isLocal =
                hostname === "localhost" ||
                hostname === "127.0.0.1" ||
                hostname.endsWith(".local")
            // In production (public host behind the Cloudflare Tunnel) the app is
            // reached over plain HTTP on an internal port, so next-intl leaks that
            // port into absolute redirects (https://tedo.vn:3000/vi or :8080).
            // Canonicalize to the public origin: https + no explicit port.
            if (!isLocal) {
                url.protocol = "https:"
                url.hostname = hostname
                url.port = ""
                response.headers.set("location", url.toString())
            }
        } catch {
            // leave the original Location untouched on parse failure
        }
    }

    return response
}

export const config = {
    matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
}
