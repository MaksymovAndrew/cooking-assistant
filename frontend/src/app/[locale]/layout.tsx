import "styles/global.scss";

import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { resolveSiteUrl } from "config/site";
import { AUTH_COOKIE_NAME } from "constants/auth";
import { isLocale, OPEN_GRAPH_LOCALES, toLocale } from "constants/locales";

import { RESOURCES } from "i18n/resources";
import { getServerTranslation } from "i18n/server";

import { Providers } from "app/providers";
import { themeInitScript } from "app/themeInit";

const ICON_PATH = "/favicon.svg";

interface LocaleParams {
    params: Promise<{ locale: string }>;
}

// canonical and og:url are per-route facts and are set by each route: inherited here they
// would tell search engines every page is the same one
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
    themeColor: process.env.THEME_COLOR_DARK,
};

interface RootLayoutProps extends LocaleParams {
    children: ReactNode;
}

// without a session cookie the visitor is a guest from the first byte, so the server renders the guest
// navigation instead of the signed-in one collapsing after hydration; with one, /me still decides
// suppressHydrationWarning: the pre-paint script sets data-theme before React hydrates
const RootLayout = async ({ children, params }: RootLayoutProps) => {
    const { locale } = await params;

    if (!isLocale(locale)) {
        notFound();
    }

    const hasSessionCookie = (await cookies()).has(AUTH_COOKIE_NAME);

    return (
        <html lang={locale} suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
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
