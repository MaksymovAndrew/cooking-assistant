// the snapshot's values are laid over the current keys, so the order either object was built in never counts as an edit
export const differsFromSnapshot = <T extends object>(
    current: T,
    snapshot: T,
): boolean =>
    JSON.stringify(current) !== JSON.stringify({ ...current, ...snapshot });
