import { useCallback, useEffect, useRef } from "react";

// markClean() flips it synchronously, so a navigation right after a save is not blocked
export const useDirtyRef = (isDirty: boolean) => {
    const isDirtyRef = useRef(isDirty);

    useEffect(() => {
        isDirtyRef.current = isDirty;
    }, [isDirty]);

    const markClean = useCallback(() => {
        isDirtyRef.current = false;
    }, []);

    return { isDirtyRef, markClean };
};
