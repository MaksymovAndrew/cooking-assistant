import { useCallback } from "react";

import { ROUTES } from "constants/routes";

import {
    useLazyGetMeQuery,
    useSetLocaleMutation,
} from "redux/services/authApi";

import { useAppRouter } from "hooks/useAppRouter";
import { useLocale } from "hooks/useLocale";

import { readLocaleCookie, writeLocaleCookie } from "utils/localeCookie";
import { localizePath, stripLocale } from "utils/localePath";
import { takeLoginRedirect } from "utils/loginRedirect";
import { loadPage } from "utils/reloadPage";

// where a fresh sign-in lands. The address bar and the account must agree on a language: a
// choice made on this device wins and is saved to the account; without one, the account's is used
export const useFinishLogin = () => {
    const router = useAppRouter();
    const locale = useLocale();
    const [fetchMe] = useLazyGetMeQuery();
    const [saveLocale] = useSetLocaleMutation();

    return useCallback(async () => {
        // the page the user was trying to reach (a private route, a guest-only "Log in" CTA)
        // rather than always the home dashboard
        const target = takeLoginRedirect() ?? ROUTES.home;
        const chosen = readLocaleCookie();

        if (chosen !== null) {
            await saveLocale(chosen);
            router.replace(target);

            return;
        }

        const { data } = await fetchMe(null);
        const accountLocale = data?.locale ?? locale;

        writeLocaleCookie(accountLocale);

        if (accountLocale === locale) {
            router.replace(target);

            return;
        }

        loadPage(localizePath(stripLocale(target), accountLocale));
    }, [fetchMe, locale, router, saveLocale]);
};
