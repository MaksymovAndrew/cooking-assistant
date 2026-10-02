// read by shape, not instanceof: a driver or filesystem error need not come from this realm's Error
export function errorField(error: unknown, field: string): unknown {
    if (typeof error !== "object" || error === null) {
        return undefined;
    }

    const value: unknown = Object.getOwnPropertyDescriptor(error, field)?.value;

    return value;
}
