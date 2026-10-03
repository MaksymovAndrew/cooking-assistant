import { useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import { useNavigationBlocker } from "components/layout/NavigationBlocker";

import { localizePath } from "utils/localePath";

import { useLocale } from "./useLocale";

export interface AppRouter {
    // false when an unsaved-changes guard deferred the navigation, which may then be dropped
    push: (href: string) => boolean;
    replace: (href: string) => boolean;
    // re-renders in place, leaving nothing behind, so it needs no unsaved-changes guard
    refresh: () => void;
}

// Next's router cannot be intercepted: every push/replace passes the unsaved-changes guard here
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
            refresh: () => {
                router.refresh();
            },
        }),
        [router, run, locale],
    );
};
