import { useEffect, useState } from "react";

import { useDebouncedValue } from "hooks/useDebouncedValue";

// instant local typing feedback + a debounced commit, with the local value resynced to `value`
// whenever it changes from outside (a reset or a chip) - adjusted during render, not via an
// effect. Comparing the settled debounce against the local value (not just `value`) means a
// mid-debounce external reset can't leak a stale commit once its own pending timer catches up
export const useDebouncedFieldSync = (
    value: string,
    onCommit: (value: string) => void,
    delayMs = 300,
): [string, (next: string) => void] => {
    const [localValue, setLocalValue] = useState(value);
    const [syncedValue, setSyncedValue] = useState(value);
    const debouncedValue = useDebouncedValue(localValue, delayMs);

    if (value !== syncedValue) {
        setSyncedValue(value);
        setLocalValue(value);
    }

    useEffect(() => {
        if (debouncedValue === localValue && debouncedValue !== value) {
            onCommit(debouncedValue);
        }
    }, [debouncedValue, localValue, value, onCommit]);

    return [localValue, setLocalValue];
};
