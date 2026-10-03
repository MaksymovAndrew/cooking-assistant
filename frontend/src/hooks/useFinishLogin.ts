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

// a language chosen on this device wins and is saved; without one, the account's is used
export const useFinishLogin = () => {
    const router = useAppRouter();
    const locale = useLocale();
    const [fetchMe] = useLazyGetMeQuery();
    const [saveLocale] = useSetLocaleMutation();

    return useCallback(async () => {
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
