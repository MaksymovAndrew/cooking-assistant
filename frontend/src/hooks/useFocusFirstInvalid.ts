import { useCallback, useEffect, useState } from "react";

import { firstInvalidField } from "utils/firstInvalidField";

// a failed submit shows its errors on the next render, so focus waits for that render to land
export const useFocusFirstInvalid = () => {
    const [form, setForm] = useState<HTMLFormElement | null>(null);
    const [focusRequest, setFocusRequest] = useState(0);

    useEffect(() => {
        if (focusRequest > 0 && form) {
            firstInvalidField(form)?.focus();
        }
    }, [focusRequest, form]);

    const focusFirstInvalid = useCallback(() => {
        setFocusRequest((count) => count + 1);
    }, []);

    return { attachForm: setForm, focusFirstInvalid };
};
