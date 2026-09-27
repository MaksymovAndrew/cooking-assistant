import { type Locale, LOCALES } from "constants/locales";

import type { FilterDef } from "./filterDef";
import { enumListFilter } from "./filterDefFactories.enum";

interface ContentLanguageParams {
    languages?: string;
}

// shared by the recipe and menu lists; one language reads as a phrase, several as a count
export const contentLanguageFilter = <
    TParams extends ContentLanguageParams,
>(): FilterDef<Locale[], TParams> =>
    enumListFilter<Locale, TParams>({
        key: "languages",
        urlParam: "lang",
        param: "languages",
        values: LOCALES,
        chipLabel: (value, t) =>
            value.length === 1
                ? t(`common:contentLanguage.in.${value[0]}`)
                : t("common:contentLanguage.filterChip", {
                      count: value.length,
                  }),
    });
