import type { MetadataRoute } from "next";

import { absoluteSiteUrl } from "config/site";
import { LOCALES } from "constants/locales";
import { PRIVATE_PATH_PREFIXES } from "constants/routes";

import { localizePath } from "utils/localePath";

const SITEMAP_PATH = "/sitemap.xml";

// the private area is also blocked by a noindex on its own layout; this only spares crawlers
// the requests, since every one of those pages answers with the login redirect anyway
const PRIVATE_PATHS_IN_EVERY_LANGUAGE = LOCALES.flatMap((locale) =>
    PRIVATE_PATH_PREFIXES.map((prefix) => localizePath(prefix, locale)),
);

const robots = (): MetadataRoute.Robots => ({
    rules: {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS_IN_EVERY_LANGUAGE,
    },
    sitemap: absoluteSiteUrl(SITEMAP_PATH),
});

export default robots;
