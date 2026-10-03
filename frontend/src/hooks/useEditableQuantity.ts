import type React from "react";
import { useState } from "react";

// own text state, so the field can go empty while typing instead of snapping back
export const useEditableQuantity = (
    value: number,
    onCommit: (value: number) => void,
    min = 0,
) => {
    const [text, setText] = useState(String(value));
    const [syncedValue, setSyncedValue] = useState(value);

    // resynced during render, not in an effect, so it lands in the same paint as the outside change
    if (value !== syncedValue) {
        setSyncedValue(value);
        setText(String(value));
    }

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setText(e.target.value);

        const parsed = parseFloat(e.target.value);

        if (!isNaN(parsed) && parsed >= min) {
            onCommit(parsed);
        }
    };

    const onBlur = (): number => {
        const parsed = parseFloat(text);
        const next = !isNaN(parsed) && parsed >= min ? parsed : value;

        setText(String(next));

        if (next !== value) {
            onCommit(next);
        }

        return next;
    };

    return { text, onChange, onBlur };
};
