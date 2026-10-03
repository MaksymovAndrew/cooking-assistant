import type { MetadataRoute } from "next";

import { absoluteSiteUrl } from "config/site";
import { LOCALES } from "constants/locales";
import { PRIVATE_PATH_PREFIXES, UNINDEXED_AUTH_PATHS } from "constants/routes";

import { localizePath } from "utils/localePath";

const SITEMAP_PATH = "/sitemap.xml";

// the pages are noindex anyway; this only spares crawlers login redirects and token-less links
const DISALLOWED_PATHS_IN_EVERY_LANGUAGE = LOCALES.flatMap((locale) =>
    [...PRIVATE_PATH_PREFIXES, ...UNINDEXED_AUTH_PATHS].map((prefix) =>
        localizePath(prefix, locale),
    ),
);

const robots = (): MetadataRoute.Robots => ({
    rules: {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOWED_PATHS_IN_EVERY_LANGUAGE,
    },
    sitemap: absoluteSiteUrl(SITEMAP_PATH),
});

export default robots;
