import type React from "react";
import { useState } from "react";

// lets a numeric field go empty while typing instead of snapping back on every keystroke; on blur an invalid or too-small entry reverts to the last committed value
export const useEditableQuantity = (
    value: number,
    onCommit: (value: number) => void,
    min = 0,
) => {
    const [text, setText] = useState(String(value));
    const [syncedValue, setSyncedValue] = useState(value);

    // resyncs the text when the committed value changes from outside (e.g. another tab editing the same pantry) - adjusted during render, not via an effect, so it lands in the same paint as the value change
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
