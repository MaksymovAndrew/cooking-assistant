// client-side mirror of FilterDef: same key/defaultValue/isActive shape, but state
// lives in local component state instead of the URL, and a filter is expressed as a
// predicate over an item instead of a URLSearchParams read/write/toParams triple
export interface ClientFilterDef<TItem, TValue> {
    key: string;
    defaultValue: TValue;
    isActive(value: TValue): boolean;
    predicate(item: TItem, value: TValue): boolean;
}
