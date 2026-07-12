import type { RefObject } from "react";
import { useBlocker } from "react-router-dom";

// intercepts in-app navigation while a form has unsaved edits; reads dirtiness through a ref so a just-saved form can disarm it synchronously before navigate
export const useUnsavedChangesBlocker = (isDirtyRef: RefObject<boolean>) => {
    const blocker = useBlocker(() => isDirtyRef.current);

    return {
        isBlocked: blocker.state === "blocked",
        proceed: () => blocker.proceed?.(),
        reset: () => blocker.reset?.(),
    };
};
