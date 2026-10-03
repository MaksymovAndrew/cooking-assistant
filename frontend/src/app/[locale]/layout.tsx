import "styles/global.scss";

import type { Metadata, Viewport } from "next";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { resolveSiteUrl } from "config/site";
import { AUTH_COOKIE_NAME } from "constants/auth";
import { isLocale, OPEN_GRAPH_LOCALES, toLocale } from "constants/locales";

import { RESOURCES } from "i18n/resources";
import { getServerTranslation } from "i18n/server";

import { NONCE_HEADER } from "utils/contentSecurityPolicy";

import { Providers } from "app/providers";
import { ThemeInitScript } from "app/ThemeInitScript";

const ICON_PATH = "/favicon.svg";

interface LocaleParams {
    params: Promise<{ locale: string }>;
}

// no canonical or og:url here: inherited, they would tell search engines every page is the same
export const generateMetadata = async ({
    params,
}: LocaleParams): Promise<Metadata> => {
    const locale = toLocale((await params).locale);
    const t = await getServerTranslation(locale);
    const title = t("appName");
    const shortDescription = t("meta.shortDescription");

    return {
        metadataBase: new URL(resolveSiteUrl()),
        title: { default: title, template: t("meta.titleTemplate") },
        description: t("meta.description"),
        icons: { icon: ICON_PATH },
        openGraph: {
            type: "website",
            siteName: title,
            title,
            description: shortDescription,
            locale: OPEN_GRAPH_LOCALES[locale],
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
    // follows the OS until the pre-paint script applies a stored choice to both
    themeColor: [
        {
            media: "(prefers-color-scheme: dark)",
            color: process.env.THEME_COLOR_DARK,
        },
        {
            media: "(prefers-color-scheme: light)",
            color: process.env.THEME_COLOR_LIGHT,
        },
    ],
};

interface RootLayoutProps extends LocaleParams {
    children: ReactNode;
}

// suppressHydrationWarning: the pre-paint script sets data-theme before React hydrates
const RootLayout = async ({ children, params }: RootLayoutProps) => {
    const { locale } = await params;

    if (!isLocale(locale)) {
        notFound();
    }

    // no session cookie means a guest from the first byte; with one, /me still decides
    const hasSessionCookie = (await cookies()).has(AUTH_COOKIE_NAME);
    const nonce = (await headers()).get(NONCE_HEADER) ?? undefined;

    return (
        <html lang={locale} suppressHydrationWarning>
            <head>
                <ThemeInitScript nonce={nonce} />
            </head>
            <body>
                <Providers
                    key={locale}
                    locale={locale}
                    resources={RESOURCES[locale]}
                    initialSessionStatus={
                        hasSessionCookie ? "checking" : "guest"
                    }
                >
                    {children}
                </Providers>
            </body>
        </html>
    );
};

export default RootLayout;
