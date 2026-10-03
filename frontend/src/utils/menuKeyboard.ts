type KeyTarget = (index: number, count: number) => number;

const KEY_TARGETS = new Map<string, KeyTarget>([
    ["ArrowDown", (index, count) => (index + 1) % count],
    ["ArrowUp", (index, count) => (index - 1 + count) % count],
    ["Home", () => 0],
    ["End", (_index, count) => count - 1],
]);

export const menuKeyTarget = (
    key: string,
    index: number,
    count: number,
): number | null => {
    const target = KEY_TARGETS.get(key) ?? null;

    return target === null ? null : target(index, count);
};

// which way to keep looking when the item a key aims at can't take focus (hidden at this width)
export const menuKeyStep = (key: string): 1 | -1 =>
    key === "ArrowUp" || key === "End" ? -1 : 1;
