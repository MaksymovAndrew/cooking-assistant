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

// the bounds the request actually carries; an inverted range can't be satisfied by either bound
// alone, so the upper one is dropped
function appliedBounds(value: NumericRangeValue): {
    min: number | null;
    max: number | null;
} {
    const min = sanitizedBound(value.min);
    const max = sanitizedBound(value.max);
    const isInvertedRange = min !== null && max !== null && min > max;

    return { min, max: isInvertedRange ? null : max };
}

// the chip names the applied range, so a value the request drops never shows as a filter
function appliedValue(value: NumericRangeValue): NumericRangeValue {
    const { min, max } = appliedBounds(value);

    return {
        min: min === null ? "" : String(min),
        max: max === null ? "" : String(max),
    };
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
            const { min, max } = appliedBounds(value);

            return {
                ...(min !== null ? { [minParam]: String(min) } : {}),
                ...(max !== null ? { [maxParam]: String(max) } : {}),
            } as Partial<TParams>;
        },
        isActive: (value) => {
            const { min, max } = appliedBounds(value);

            return min !== null || max !== null;
        },
        chipLabel: chipLabel
            ? (value, t) => chipLabel(appliedValue(value), t)
            : undefined,
    };
}
