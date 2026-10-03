// spread over the current keys, so key order alone never counts as an edit
export const differsFromSnapshot = <T extends object>(
    current: T,
    snapshot: T,
): boolean =>
    JSON.stringify(current) !== JSON.stringify({ ...current, ...snapshot });
