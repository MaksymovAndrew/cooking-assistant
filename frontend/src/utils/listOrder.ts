import type { MoveDirection } from "types/reorder";

// the item at fromIndex lands right before the one at toIndex
export const moveBefore = <T>(
    list: T[],
    fromIndex: number,
    toIndex: number,
): T[] => {
    const isNoOp = fromIndex === -1 || toIndex === -1 || fromIndex === toIndex;

    if (isNoOp) {
        return list;
    }

    const next = [...list];
    const [moved] = next.splice(fromIndex, 1);
    // the removal shifts later indexes left, so a forward move inserts one slot earlier
    const insertAt = fromIndex < toIndex ? toIndex - 1 : toIndex;

    next.splice(insertAt, 0, moved);

    return next;
};

export const toggleValue = <T>(list: T[], value: T): T[] =>
    list.includes(value)
        ? list.filter((entry) => entry !== value)
        : [...list, value];

// as a moveBefore pair: up puts the item before its neighbour, down the neighbour before it
export const stepMovePair = <T>(
    list: T[],
    item: T,
    direction: MoveDirection,
): [T, T] | null => {
    const index = list.indexOf(item);
    const neighbour = index + direction;
    const isOutOfRange =
        index === -1 || neighbour < 0 || neighbour >= list.length;

    if (isOutOfRange) {
        return null;
    }

    return direction === -1 ? [item, list[neighbour]] : [list[neighbour], item];
};
