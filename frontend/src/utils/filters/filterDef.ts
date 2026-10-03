import type { TFunction } from "i18next";

// method shorthand on purpose: bivariant params let any TValue share a FilterDef<unknown> array
export interface FilterDef<TValue, TParams> {
    key: string;
    defaultValue: TValue;
    read(searchParams: URLSearchParams): TValue;
    write(searchParams: URLSearchParams, value: TValue): void;
    toParams(value: TValue): Partial<TParams>;
    isActive(value: TValue): boolean;
    chipLabel?(value: TValue, t: TFunction): string;
}
