import { useCallback, useEffect, useRef } from "react";

// ref mirror of a form's isDirty for the navigation blocker: markClean() flips it synchronously, so navigate() right after a successful save is not blocked
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
