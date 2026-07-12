import react from "@vitejs/plugin-react-swc";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

// dev-proxy target is overridable via env; defaults to the local backend port
const proxyTarget =
    process.env.VITE_DEV_PROXY_TARGET ?? "http://localhost:3000";

const srcDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "src",
);
const nodeModulesDir = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "node_modules",
);

const themeColorsFromTokens = (): Plugin => ({
    name: "theme-colors-from-tokens",
    transformIndexHtml(html) {
        const tokens = fs.readFileSync(
            path.resolve(srcDir, "styles/_tokens.scss"),
            "utf8",
        );
        const [dark, light] = [
            ...tokens.matchAll(/--bg:\s*(#[0-9a-fA-F]+)/g),
        ].map((match) => match[1]);

        if (!dark || !light) {
            throw new Error(
                "theme-colors-from-tokens: --bg values not found in _tokens.scss",
            );
        }

        return html
            .replaceAll("%THEME_COLOR_DARK%", dark)
            .replaceAll("%THEME_COLOR_LIGHT%", light);
    },
});

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), themeColorsFromTokens()],
    resolve: {
        // native tsconfig paths support (replaces the vite-tsconfig-paths plugin)
        tsconfigPaths: true,
    },
    build: {
        rolldownOptions: {
            output: {
                // strip console/debugger from the production build only; dev keeps them
                minify: {
                    mangle: true,
                    codegen: true,
                    compress: {
                        dropConsole: true,
                        dropDebugger: true,
                    },
                },
            },
        },
    },
    css: {
        // lets SCSS modules `@use "styles/..."` the same way TS uses the bare alias
        preprocessorOptions: {
            scss: {
                loadPaths: [srcDir, nodeModulesDir],
            },
        },
    },
    server: {
        port: 8080,
        // same-origin in dev: the browser sees /api on :8080 and Vite forwards it
        // to the backend, so the auth cookie is first-party without TLS
        proxy: {
            "/api": {
                target: proxyTarget,
                changeOrigin: true,
            },
        },
    },
});
