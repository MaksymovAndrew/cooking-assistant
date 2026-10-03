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

// the TState cast below holds: every key comes from a def built for this exact TState
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
