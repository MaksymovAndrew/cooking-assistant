import type { RefObject } from "react";
import { useEffect } from "react";

import { useNavigationBlocker } from "components/layout/NavigationBlocker";

// the ref lets a just-saved form disarm at once; the boolean arms the back-button guard
export const useUnsavedChangesBlocker = (
    isDirty: boolean,
    isDirtyRef: RefObject<boolean>,
) => {
    const { register, arm, isBlocked, proceed, reset } = useNavigationBlocker();

    useEffect(() => register(isDirtyRef), [register, isDirtyRef]);

    useEffect(() => {
        arm(isDirty);
    }, [arm, isDirty]);

    return { isBlocked, proceed, reset };
};
