import type { TFunction } from "i18next";

import type { FilterDef } from "./filterDef";
import { setOrDelete } from "./filterDefFactories";

interface BooleanFilterConfig<TParams> {
    key: string;
    urlParam: string;
    param: keyof TParams & string;
    chipLabel?: (value: boolean, t: TFunction) => string;
}

// exported so a page can build a link that pre-sets a boolean filter (see PantryRecipesCard)
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

interface EnumFilterConfig<T extends string, TParams> {
    key: string;
    urlParam: string;
    param: keyof TParams & string;
    values: readonly T[];
    chipLabel?: (value: T | null, t: TFunction) => string;
}

export function enumFilter<T extends string, TParams>({
    key,
    urlParam,
    param,
    values,
    chipLabel,
}: EnumFilterConfig<T, TParams>): FilterDef<T | null, TParams> {
    const isValid = (raw: string | null): raw is T =>
        raw !== null && (values as readonly string[]).includes(raw);

    return {
        key,
        defaultValue: null,
        read: (searchParams) => {
            const raw = searchParams.get(urlParam);

            return isValid(raw) ? raw : null;
        },
        write(searchParams, value) {
            setOrDelete(searchParams, urlParam, value);
        },
        toParams: (value) =>
            value !== null ? ({ [param]: value } as Partial<TParams>) : {},
        isActive: (value) => value !== null,
        chipLabel,
    };
}

interface EnumListFilterConfig<T extends string, TParams> {
    key: string;
    urlParam: string;
    param: keyof TParams & string;
    values: readonly T[];
    chipLabel?: (value: T[], t: TFunction) => string;
}

// a multi-pick of known values; anything else in the URL is dropped rather than sent for the backend to reject
export function enumListFilter<T extends string, TParams>({
    key,
    urlParam,
    param,
    values,
    chipLabel,
}: EnumListFilterConfig<T, TParams>): FilterDef<T[], TParams> {
    const isValid = (raw: string): raw is T =>
        (values as readonly string[]).includes(raw);

    return {
        key,
        defaultValue: [],
        read: (searchParams) =>
            Array.from(
                new Set((searchParams.get(urlParam) ?? "").split(",")),
            ).filter(isValid),
        write(searchParams, value) {
            setOrDelete(
                searchParams,
                urlParam,
                value.length > 0 ? value.join(",") : null,
            );
        },
        toParams: (value) =>
            value.length > 0
                ? ({ [param]: value.join(",") } as Partial<TParams>)
                : {},
        isActive: (value) => value.length > 0,
        chipLabel,
    };
}
