import type { MetadataRoute } from "next";

import { APP_ICON_SIZES, APP_ICON_TYPE, appIconPath } from "constants/appIcons";
import { DEFAULT_LOCALE } from "constants/locales";
import { ROUTES } from "constants/routes";

import { getServerTranslation } from "i18n/server";

// the mark sits inside the maskable safe zone, so one image serves both purposes
const ICON_PURPOSES = ["any", "maskable"] as const;

// one manifest for every language: "/" sends each visitor on to their own on launch
const manifest = async (): Promise<MetadataRoute.Manifest> => {
    const t = await getServerTranslation(DEFAULT_LOCALE);

    return {
        id: ROUTES.home,
        name: t("appName"),
        short_name: t("appName"),
        description: t("meta.shortDescription"),
        lang: DEFAULT_LOCALE,
        start_url: ROUTES.home,
        scope: ROUTES.home,
        display: "standalone",
        // the theme the app opens in before it knows the visitor's preference
        background_color: process.env.THEME_COLOR_DARK,
        theme_color: process.env.THEME_COLOR_DARK,
        icons: APP_ICON_SIZES.flatMap((size) =>
            ICON_PURPOSES.map((purpose) => ({
                src: appIconPath(size),
                sizes: `${String(size)}x${String(size)}`,
                type: APP_ICON_TYPE,
                purpose,
            })),
        ),
    };
};

export default manifest;
