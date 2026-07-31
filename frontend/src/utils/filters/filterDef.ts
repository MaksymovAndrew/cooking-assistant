import type { TFunction } from "i18next";

// method shorthand (not arrow-typed properties) is deliberate: it gives bivariant
// parameter checking, which is what lets defs of different concrete TValue live
// together in one array typed FilterDef<unknown, TParams> without an `as` cast
export interface FilterDef<TValue, TParams> {
    key: string;
    defaultValue: TValue;
    read(searchParams: URLSearchParams): TValue;
    write(searchParams: URLSearchParams, value: TValue): void;
    toParams(value: TValue): Partial<TParams>;
    isActive(value: TValue): boolean;
    chipLabel?(value: TValue, t: TFunction): string;
}
