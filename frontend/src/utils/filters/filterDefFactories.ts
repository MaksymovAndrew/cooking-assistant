import type { TFunction } from "i18next";

import type { FilterDef } from "./filterDef";

export function setOrDelete(
    searchParams: URLSearchParams,
    urlParam: string,
    value: string | null,
): void {
    if (value === null) {
        searchParams.delete(urlParam);
    } else {
        searchParams.set(urlParam, value);
    }
}

interface TextFilterConfig<TParams> {
    key: string;
    urlParam: string;
    param?: keyof TParams & string;
    chipLabel?: (value: string, t: TFunction) => string;
}

// param is optional because a text filter's meaning is page-specific: menus map the
// text straight onto a "name contains" param, recipes first resolve it to ingredient
// ids against the catalog and fold that in themselves
export function textFilter<TParams>({
    key,
    urlParam,
    param,
    chipLabel,
}: TextFilterConfig<TParams>): FilterDef<string, TParams> {
    return {
        key,
        defaultValue: "",
        read: (searchParams) => searchParams.get(urlParam) ?? "",
        write(searchParams, value) {
            setOrDelete(searchParams, urlParam, value === "" ? null : value);
        },
        toParams: (value) =>
            param && value !== ""
                ? ({ [param]: value } as Partial<TParams>)
                : {},
        isActive: (value) => value !== "",
        chipLabel,
    };
}

interface IdListFilterConfig<TParams> {
    key: string;
    urlParam: string;
    param: keyof TParams & string;
    chipLabel?: (value: number[], t: TFunction) => string;
}

export function idListFilter<TParams>({
    key,
    urlParam,
    param,
    chipLabel,
}: IdListFilterConfig<TParams>): FilterDef<number[], TParams> {
    return {
        key,
        defaultValue: [],
        read: (searchParams) => {
            const raw = searchParams.get(urlParam);

            if (!raw) {
                return [];
            }

            return raw
                .split(",")
                .map(Number)
                .filter((id) => !Number.isNaN(id));
        },
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

export interface NumericRangeValue {
    min: string;
    max: string;
}

interface NumericRangeFilterConfig<TParams> {
    key: string;
    urlParam: string;
    minParam: keyof TParams & string;
    maxParam: keyof TParams & string;
    chipLabel?: (value: NumericRangeValue, t: TFunction) => string;
}

// urlParam is a prefix: the two URL keys are `${urlParam}_min`/`${urlParam}_max`
export function numericRangeFilter<TParams>({
    key,
    urlParam,
    minParam,
    maxParam,
    chipLabel,
}: NumericRangeFilterConfig<TParams>): FilterDef<NumericRangeValue, TParams> {
    const minKey = `${urlParam}_min`;
    const maxKey = `${urlParam}_max`;

    return {
        key,
        defaultValue: { min: "", max: "" },
        read: (searchParams) => ({
            min: searchParams.get(minKey) ?? "",
            max: searchParams.get(maxKey) ?? "",
        }),
        write(searchParams, value) {
            setOrDelete(
                searchParams,
                minKey,
                value.min === "" ? null : value.min,
            );
            setOrDelete(
                searchParams,
                maxKey,
                value.max === "" ? null : value.max,
            );
        },
        toParams: (value) =>
            ({
                ...(value.min !== "" ? { [minParam]: value.min } : {}),
                ...(value.max !== "" ? { [maxParam]: value.max } : {}),
            }) as Partial<TParams>,
        isActive: (value) => value.min !== "" || value.max !== "",
        chipLabel,
    };
}
