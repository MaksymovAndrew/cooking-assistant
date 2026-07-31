import { useCallback, useMemo, useState } from "react";

import type { ClientFilterDef } from "utils/filters/clientFilterDef";

export type SetClientFilterValue<TState> = <K extends keyof TState & string>(
    key: K,
    value: TState[K],
) => void;

export interface UseClientFiltersResult<TItem, TState> {
    values: TState;
    setValue: SetClientFilterValue<TState>;
    reset: () => void;
    visibleItems: TItem[];
    activeCount: number;
    hasActiveFilters: boolean;
}

const initialState = (
    defs: readonly ClientFilterDef<unknown, unknown>[],
): Record<string, unknown> =>
    defs.reduce<Record<string, unknown>>(
        (state, def) => ({ ...state, [def.key]: def.defaultValue }),
        {},
    );

// client-side mirror of useListFilters: state lives in component state instead of the
// URL, and every filter is an AND'd predicate over the item list instead of a request
// param - visibleItems is the memoized equivalent of the server side's request params.
// state is a plain Record (defs aren't parameterized by TState), so the caller-specified
// TState is applied with one deliberate cast below, correct by construction: every key
// it holds comes from a def built for this exact TState (mirrors useListFilters.ts)
export function useClientFilters<TItem, TState extends object>(
    defs: readonly ClientFilterDef<TItem, unknown>[],
    items: TItem[],
): UseClientFiltersResult<TItem, TState> {
    const [state, setState] = useState<Record<string, unknown>>(() =>
        initialState(defs),
    );

    const setValue = useCallback(
        <K extends keyof TState & string>(key: K, value: TState[K]) => {
            setState((prev) => ({ ...prev, [key]: value }));
        },
        [],
    );

    const reset = useCallback(() => {
        setState(initialState(defs));
    }, [defs]);

    const activeDefs = useMemo(
        () => defs.filter((def) => def.isActive(state[def.key])),
        [defs, state],
    );

    const visibleItems = useMemo(
        () =>
            items.filter((item) =>
                activeDefs.every((def) => def.predicate(item, state[def.key])),
            ),
        [items, activeDefs, state],
    );

    return {
        values: state as TState,
        setValue,
        reset,
        visibleItems,
        activeCount: activeDefs.length,
        hasActiveFilters: activeDefs.length > 0,
    };
}
