"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import { useNavigationBlocker } from "components/layout/NavigationBlocker";

import { localizePath } from "utils/localePath";

import { useLocale } from "./useLocale";

export interface AppRouter {
    // both report whether the navigation actually started: it is deferred, and may be dropped
    // altogether, when a form holds unsaved changes
    push: (href: string) => boolean;
    replace: (href: string) => boolean;
}

// the only way pages and hooks navigate programmatically: next/router itself cannot be
// intercepted, so every push/replace is routed through the unsaved-changes guard here - and a path
// from constants/routes is taken to the page's own language
export const useAppRouter = (): AppRouter => {
    const router = useRouter();
    const locale = useLocale();
    const { hasUnsavedChanges, defer } = useNavigationBlocker();

    const run = useCallback(
        (perform: () => void) => {
            if (hasUnsavedChanges()) {
                defer(perform);

                return false;
            }

            perform();

            return true;
        },
        [defer, hasUnsavedChanges],
    );

    return useMemo(
        () => ({
            push: (href: string) =>
                run(() => {
                    router.push(localizePath(href, locale));
                }),
            replace: (href: string) =>
                run(() => {
                    router.replace(localizePath(href, locale));
                }),
        }),
        [router, run, locale],
    );
};
