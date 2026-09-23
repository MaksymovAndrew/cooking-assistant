// a drag-and-drop move: the item at fromIndex lands right before the one at toIndex. The same
// list comes back untouched for a missing index or a drop onto itself
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
    // removing `moved` shifts every later index left by one, so a forward move lands one slot
    // earlier than the target's pre-removal index, or it would overshoot past the drop target
    const insertAt = fromIndex < toIndex ? toIndex - 1 : toIndex;

    next.splice(insertAt, 0, moved);

    return next;
};

// adds the value if the list lacks it, removes it if it holds it
export const toggleValue = <T>(list: T[], value: T): T[] =>
    list.includes(value)
        ? list.filter((entry) => entry !== value)
        : [...list, value];
