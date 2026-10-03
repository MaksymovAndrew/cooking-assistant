import { useEffect, useState } from "react";

import { useDebouncedValue } from "hooks/useDebouncedValue";

// commits only a settled value that still equals the local one, so a reset can't leak a stale edit
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
