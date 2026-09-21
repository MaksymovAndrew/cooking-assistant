import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";

const rootDir = import.meta.dirname;
const srcDir = path.join(rootDir, "src");

// the design tokens stay the single source of truth for the browser-chrome colour
const readThemeColors = () => {
    const tokens = fs.readFileSync(
        path.join(srcDir, "styles/_tokens.scss"),
        "utf8",
    );
    const [dark, light] = [...tokens.matchAll(/--bg:\s*(#[0-9a-fA-F]+)/g)].map(
        (match) => match[1],
    );

    if (!dark || !light) {
        throw new Error("Theme colours: --bg values not found in _tokens.scss");
    }

    return { dark, light };
};

const scssLoadPaths = [srcDir, path.join(rootDir, "node_modules")];
const themeColors = readThemeColors();
const isProduction = process.env.NODE_ENV === "production";

// dev-proxy target is overridable via env; defaults to the local backend port
const apiProxyTarget = process.env.API_INTERNAL_URL ?? "http://localhost:3000";

// uploaded images are served by the API domain; in dev they come through the same-origin proxy
const apiOrigin = process.env.NEXT_PUBLIC_API_URL
    ? new URL(process.env.NEXT_PUBLIC_API_URL).origin
    : "";

// deliberately no script-src: a nonce-based policy needs middleware to mint a nonce per request,
// which this app does not have. These directives hold without one
const CONTENT_SECURITY_POLICY = [
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    // blob: is the local preview of a photo before it is uploaded
    `img-src 'self' data: blob: ${apiOrigin}`.trim(),
].join("; ");

const SECURITY_HEADERS = [
    { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), payment=()",
    },
];

const nextConfig: NextConfig = {
    output: "standalone",
    // wait for generateMetadata before answering instead of streaming it in later. The page
    // needs that same request anyway (React cache() shares it), so it costs nothing - and it is
    // half of what makes a missing recipe answer with a real 404. The other half is that no
    // loading.tsx sits above those routes: either one alone still yields a 200 with a 404 body
    htmlLimitedBots: /.*/,
    // the repository documents its own conventions; a generated per-package copy would
    // compete with them and be rewritten on every dev run
    agentRules: false,
    // this package is the workspace root; without it the sibling lockfiles upstream make
    // Next guess, and standalone output would trace the wrong tree
    turbopack: { root: rootDir },
    outputFileTracingRoot: rootDir,
    env: {
        THEME_COLOR_DARK: themeColors.dark,
        THEME_COLOR_LIGHT: themeColors.light,
    },
    sassOptions: {
        // lets SCSS modules `@use "styles/..."` the same way TS uses the bare alias
        loadPaths: scssLoadPaths,
    },
    headers: () =>
        Promise.resolve([{ source: "/:path*", headers: SECURITY_HEADERS }]),
    // same-origin in dev: the browser sees /api on :8080 and Next forwards it to the
    // backend, so the auth cookie is first-party without TLS. Deployed, the browser
    // talks to the API domain directly.
    rewrites: () =>
        Promise.resolve(
            isProduction
                ? []
                : [
                      {
                          source: "/api/:path*",
                          destination: `${apiProxyTarget}/api/:path*`,
                      },
                  ],
        ),
};

export default nextConfig;
