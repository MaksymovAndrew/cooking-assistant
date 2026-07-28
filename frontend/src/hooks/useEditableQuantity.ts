import type React from "react";
import { useEffect, useState } from "react";

// lets a numeric field go empty while typing instead of snapping back on every keystroke; on blur an invalid or too-small entry reverts to the last committed value
export const useEditableQuantity = (
    value: number,
    onCommit: (value: number) => void,
    min = 0,
) => {
    const [text, setText] = useState(String(value));

    useEffect(() => {
        setText(String(value));
    }, [value]);

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
