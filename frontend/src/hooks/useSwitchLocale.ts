import { useCallback } from "react";

import type { Locale } from "constants/locales";

import { useAppSelector } from "redux/hooks";
import { selectIsAuthed } from "redux/selectors/sessionSelectors";
import { useSetLocaleMutation } from "redux/services/authApi";

import { writeLocaleCookie } from "utils/localeCookie";
import { switchLocaleHref } from "utils/localePath";
import { loadPage } from "utils/reloadPage";

import { useLocale } from "./useLocale";

// the whole page is loaded again in the new language: its strings, dates and the root layout's
// lang all come from the server render, so there is nothing to switch in place
export const useSwitchLocale = () => {
    const currentLocale = useLocale();
    const isAuthed = useAppSelector(selectIsAuthed);
    const [saveLocale] = useSetLocaleMutation();

    return useCallback(
        async (locale: Locale) => {
            if (locale === currentLocale) {
                return;
            }

            writeLocaleCookie(locale);

            // the account keeps it for the emails it is sent later
            if (isAuthed) {
                await saveLocale(locale);
            }

            loadPage(switchLocaleHref(window.location, locale));
        },
        [currentLocale, isAuthed, saveLocale],
    );
};
