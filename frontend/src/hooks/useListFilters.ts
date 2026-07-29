import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

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

export interface UseListFiltersResult<TState, TParams> {
    values: TState;
    setValue: SetFilterValue<TState>;
    reset: () => void;
    params: TParams;
    activeFilters: ActiveFilterEntry<TParams>[];
    activeCount: number;
    hasActiveFilters: boolean;
}

// URL is the single source of truth for filter state - values/params/activeFilters
// are all derived from it on every render, never cached in component or store state.
// readState returns a plain Record (filterState.ts isn't parameterized by TState -
// there's nothing in its inputs to infer it from), so the caller-specified TState is
// applied with one deliberate cast, right here, correct by construction: every key it
// reads comes from a def that was built for this exact TState (see recipeFilterDefs.ts)
export function useListFilters<TState extends object, TParams>(
    defs: readonly FilterDef<unknown, TParams>[],
): UseListFiltersResult<TState, TParams> {
    const [searchParams, setSearchParams] = useSearchParams();

    const rawValues = readState<TParams>(defs, searchParams);
    const values = rawValues as TState;
    const params = buildParams<TParams>(defs, rawValues);

    const setRaw = useCallback(
        (key: string, value: unknown, options?: SetFilterValueOptions) => {
            const nextValues = { ...rawValues, [key]: value };
            const next = writeState<TParams>(defs, nextValues, searchParams);

            setSearchParams(next, { replace: options?.replace });
        },
        [defs, rawValues, searchParams, setSearchParams],
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

    const reset = useCallback(() => {
        const next = writeState<TParams>(
            defs,
            resetState<TParams>(defs),
            searchParams,
        );

        setSearchParams(next);
    }, [defs, searchParams, setSearchParams]);

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
        reset,
        params,
        activeFilters,
        activeCount: activeFilters.length,
        hasActiveFilters: activeFilters.length > 0,
    };
}
