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

const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;

const apiProxyTarget = process.env.API_INTERNAL_URL ?? "http://localhost:3000";

// the Content-Security-Policy is not here: it carries a per-request nonce, so src/proxy.ts sends it
const SECURITY_HEADERS = [
    {
        key: "Strict-Transport-Security",
        value: `max-age=${ONE_YEAR_IN_SECONDS}; includeSubDomains; preload`,
    },
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
    // awaits generateMetadata so a missing record answers 404; a loading.tsx above would undo it
    htmlLimitedBots: /.*/,
    // the repository documents its own conventions; a generated copy would compete with them
    agentRules: false,
    // without it the lockfiles upstream make Next guess the root and trace the wrong tree
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
    // dev only: proxying /api keeps the auth cookie first-party without TLS
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
