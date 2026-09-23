const DEV_SITE_URL = "http://localhost:8080";

// canonical, social, robots and sitemap URLs all resolve against this, so it follows the
// deployment. A production build without it would ship localhost URLs that nothing downstream
// would flag, so it fails the build instead.
export const resolveSiteUrl = (): string => {
    const configured = process.env.NEXT_PUBLIC_SITE_URL;

    if (configured) {
        return configured;
    }

    if (process.env.NODE_ENV === "production") {
        throw new Error(
            "NEXT_PUBLIC_SITE_URL must be set for a production build: canonical and social URLs resolve against it.",
        );
    }

    return DEV_SITE_URL;
};

// an absolute URL passes through unchanged, which is what a photo on the API domain needs
export const absoluteSiteUrl = (path: string): string =>
    new URL(path, resolveSiteUrl()).toString();
