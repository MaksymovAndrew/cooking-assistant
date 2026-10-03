import type { TFunction } from "i18next";

import type { FilterDef } from "./filterDef";
import { setOrDelete } from "./filterDefFactories";

interface BooleanFilterConfig<TParams> {
    key: string;
    urlParam: string;
    param: keyof TParams & string;
    chipLabel?: (value: boolean, t: TFunction) => string;
}

export const BOOLEAN_URL_TRUE = "1";

export function booleanFilter<TParams>({
    key,
    urlParam,
    param,
    chipLabel,
}: BooleanFilterConfig<TParams>): FilterDef<boolean, TParams> {
    return {
        key,
        defaultValue: false,
        read: (searchParams) => searchParams.get(urlParam) === BOOLEAN_URL_TRUE,
        write(searchParams, value) {
            setOrDelete(
                searchParams,
                urlParam,
                value ? BOOLEAN_URL_TRUE : null,
            );
        },
        toParams: (value) =>
            value ? ({ [param]: true } as Partial<TParams>) : {},
        isActive: (value) => value,
        chipLabel,
    };
}
