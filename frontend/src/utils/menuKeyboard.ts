type KeyTarget = (index: number, count: number) => number;

const KEY_TARGETS = new Map<string, KeyTarget>([
    ["ArrowDown", (index, count) => (index + 1) % count],
    ["ArrowUp", (index, count) => (index - 1 + count) % count],
    ["Home", () => 0],
    ["End", (_index, count) => count - 1],
]);

// the item a menu key moves focus to, wrapping at both ends; null for a key the menu leaves alone
export const menuKeyTarget = (
    key: string,
    index: number,
    count: number,
): number | null => {
    const target = KEY_TARGETS.get(key) ?? null;

    return target === null ? null : target(index, count);
};
