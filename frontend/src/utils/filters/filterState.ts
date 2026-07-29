import type { FilterDef } from "./filterDef";

export interface ActiveFilterEntry<TParams> {
    def: FilterDef<unknown, TParams>;
    value: unknown;
}

export const readState = <TParams>(
    defs: readonly FilterDef<unknown, TParams>[],
    searchParams: URLSearchParams,
): Record<string, unknown> =>
    defs.reduce<Record<string, unknown>>(
        (state, def) => ({ ...state, [def.key]: def.read(searchParams) }),
        {},
    );

export const writeState = <TParams>(
    defs: readonly FilterDef<unknown, TParams>[],
    state: Record<string, unknown>,
    currentParams: URLSearchParams,
): URLSearchParams => {
    const next = new URLSearchParams(currentParams);

    defs.forEach((def) => {
        def.write(next, state[def.key]);
    });

    return next;
};

export const buildParams = <TParams>(
    defs: readonly FilterDef<unknown, TParams>[],
    state: Record<string, unknown>,
): TParams =>
    defs.reduce(
        (params, def) => ({ ...params, ...def.toParams(state[def.key]) }),
        {} as TParams,
    );

export const activeDefs = <TParams>(
    defs: readonly FilterDef<unknown, TParams>[],
    state: Record<string, unknown>,
): ActiveFilterEntry<TParams>[] =>
    defs
        .filter((def) => def.isActive(state[def.key]))
        .map((def) => ({ def, value: state[def.key] }));

export const resetState = <TParams>(
    defs: readonly FilterDef<unknown, TParams>[],
): Record<string, unknown> =>
    defs.reduce<Record<string, unknown>>(
        (state, def) => ({ ...state, [def.key]: def.defaultValue }),
        {},
    );
