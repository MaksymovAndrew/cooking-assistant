import i18n from "i18n/index";

let catalogPromise: Promise<void> | null = null;

// idempotent while in flight or resolved; reset to null on failure so a later call retries instead of reusing a rejected promise forever
export const ensureCatalogLoaded = (): Promise<void> => {
    catalogPromise ??= import("i18n/locales/en/catalog.json")
        .then((module) => {
            i18n.addResourceBundle("en", "catalog", module.default);
        })
        .catch((error: unknown) => {
            catalogPromise = null;
            throw error;
        });

    return catalogPromise;
};
