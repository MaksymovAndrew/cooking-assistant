import "styles/global.scss";

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { resolveSiteUrl } from "config/site";

import { DEFAULT_LANGUAGE } from "i18n/resources";
import { getServerTranslation } from "i18n/server";

import { Providers } from "./providers";
import { themeInitScript } from "./themeInit";

const ICON_PATH = "/favicon.svg";

// canonical and og:url are per-route facts and are set by each route: inherited here they
// would tell search engines every page is the same one
export const generateMetadata = async (): Promise<Metadata> => {
    const t = await getServerTranslation();
    const title = t("appName");
    const description = t("meta.description");
    const shortDescription = t("meta.shortDescription");

    return {
        metadataBase: new URL(resolveSiteUrl()),
        title: { default: title, template: t("meta.titleTemplate") },
        description,
        icons: { icon: ICON_PATH },
        openGraph: {
            type: "website",
            siteName: title,
            title,
            description: shortDescription,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description: shortDescription,
        },
    };
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    colorScheme: "dark light",
    themeColor: process.env.THEME_COLOR_DARK,
};

interface RootLayoutProps {
    children: ReactNode;
}

// suppressHydrationWarning: the pre-paint script sets data-theme before React hydrates
const RootLayout = ({ children }: RootLayoutProps) => (
    <html lang={DEFAULT_LANGUAGE} suppressHydrationWarning>
        <head>
            <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        </head>
        <body>
            <Providers>{children}</Providers>
        </body>
    </html>
);

export default RootLayout;
