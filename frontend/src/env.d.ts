// Next inlines these at build time, so the list is the contract of what the frontend needs configured
declare namespace NodeJS {
    interface ProcessEnv {
        readonly NODE_ENV: "development" | "production" | "test";
        readonly NEXT_PUBLIC_API_URL?: string;
        readonly NEXT_PUBLIC_SITE_URL?: string;
        readonly THEME_COLOR_DARK: string;
        readonly THEME_COLOR_LIGHT: string;
    }
}

declare const process: { readonly env: NodeJS.ProcessEnv };
