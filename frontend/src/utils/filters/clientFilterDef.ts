export interface ClientFilterDef<TItem, TValue> {
    key: string;
    defaultValue: TValue;
    isActive(value: TValue): boolean;
    predicate(item: TItem, value: TValue): boolean;
}
