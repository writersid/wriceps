import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Where the page may load from or send to. Inline scripts are allowed because
// pages are prebuilt (no per-request nonce): Next's own bootstrap and the theme
// script in app/layout.tsx are inline. blob: is the result card's preview.
// connect-src adds PostHog's host (lib/analytics.ts), read at build time.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  `connect-src 'self'${process.env.NEXT_PUBLIC_POSTHOG_HOST ? ` ${process.env.NEXT_PUBLIC_POSTHOG_HOST}` : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
