import { useCallback } from "react";

import { useFilterSearchParams } from "hooks/useFilterSearchParams";

import type { FilterDef } from "utils/filters/filterDef";
import {
    activeDefs as computeActiveDefs,
    buildParams,
    readState,
    resetState,
    writeState,
} from "utils/filters/filterState";

export interface ActiveFilterEntry<TParams> {
    def: FilterDef<unknown, TParams>;
    value: unknown;
    remove: () => void;
}

export interface SetFilterValueOptions {
    replace?: boolean;
}

export type SetFilterValue<TState> = <K extends keyof TState & string>(
    key: K,
    value: TState[K],
    options?: SetFilterValueOptions,
) => void;

export type SetFilterValues<TState> = (
    partial: Partial<TState>,
    options?: SetFilterValueOptions,
) => void;

export interface UseListFiltersResult<TState, TParams> {
    values: TState;
    setValue: SetFilterValue<TState>;
    setValues: SetFilterValues<TState>;
    reset: () => void;
    params: TParams;
    activeFilters: ActiveFilterEntry<TParams>[];
    activeCount: number;
    hasActiveFilters: boolean;
}

// the URL is the only filter state: nothing is cached in component or store state
export function useListFilters<TState extends object, TParams>(
    defs: readonly FilterDef<unknown, TParams>[],
): UseListFiltersResult<TState, TParams> {
    const { currentParams, setSearchParams } = useFilterSearchParams();

    const rawValues = readState<TParams>(defs, currentParams);
    // the cast holds: every key comes from a def built for this exact TState
    const values = rawValues as TState;
    const params = buildParams<TParams>(defs, rawValues);

    const setRaw = useCallback(
        (key: string, value: unknown, options?: SetFilterValueOptions) => {
            const nextValues = { ...rawValues, [key]: value };
            const next = writeState<TParams>(defs, nextValues, currentParams);

            setSearchParams(next, options);
        },
        [currentParams, defs, rawValues, setSearchParams],
    );

    const setValue = useCallback(
        <K extends keyof TState & string>(
            key: K,
            value: TState[K],
            options?: SetFilterValueOptions,
        ) => {
            setRaw(key, value, options);
        },
        [setRaw],
    );

    // one write for several keys: repeated setValue() calls all read the same stale params
    const setValues = useCallback(
        (partial: Partial<TState>, options?: SetFilterValueOptions) => {
            const nextValues = { ...rawValues, ...partial };
            const next = writeState<TParams>(defs, nextValues, currentParams);

            setSearchParams(next, options);
        },
        [currentParams, defs, rawValues, setSearchParams],
    );

    const reset = useCallback(() => {
        const next = writeState<TParams>(
            defs,
            resetState<TParams>(defs),
            currentParams,
        );

        setSearchParams(next);
    }, [currentParams, defs, setSearchParams]);

    const activeFilters: ActiveFilterEntry<TParams>[] =
        computeActiveDefs<TParams>(defs, rawValues).map(({ def, value }) => ({
            def,
            value,
            remove: () => {
                setRaw(def.key, def.defaultValue);
            },
        }));

    return {
        values,
        setValue,
        setValues,
        reset,
        params,
        activeFilters,
        activeCount: activeFilters.length,
        hasActiveFilters: activeFilters.length > 0,
    };
}
