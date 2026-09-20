import type { TFunction } from "i18next";

import type { FilterDef } from "./filterDef";
import { setOrDelete } from "./filterDefFactories";

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

// a value the backend would reject (zero, negative, non-integer) is dropped, same as an empty field
function sanitizedBound(raw: string): number | null {
    const parsed = Number(raw);
    const isPositiveInteger =
        raw !== "" && Number.isInteger(parsed) && parsed > 0;

    return isPositiveInteger ? parsed : null;
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
        // only the request params are sanitized - the raw text the user typed is left untouched
        toParams: (value) => {
            const min = sanitizedBound(value.min);
            const max = sanitizedBound(value.max);
            // an inverted range can't be satisfied by either bound alone - drop the upper one
            const isInvertedRange = min !== null && max !== null && min > max;
            const validMax = isInvertedRange ? null : max;

            return {
                ...(min !== null ? { [minParam]: String(min) } : {}),
                ...(validMax !== null ? { [maxParam]: String(validMax) } : {}),
            } as Partial<TParams>;
        },
        isActive: (value) => value.min !== "" || value.max !== "",
        chipLabel,
    };
}
