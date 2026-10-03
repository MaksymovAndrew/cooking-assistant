import type { RefObject } from "react";
import { useEffect } from "react";

import {
    isGuardEntry,
    pushGuardEntry,
    STEPS_BACK_ON_PROCEED,
} from "./guardHistoryEntry";

export const useBrowserExitGuards = (
    hasUnsavedChanges: () => boolean,
    guardEntryPushed: RefObject<boolean>,
    defer: (perform: () => void) => void,
) => {
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (hasUnsavedChanges()) {
                event.preventDefault();
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [hasUnsavedChanges]);

    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            // landing on the guard entry itself: same URL as its neighbour, so nothing to block
            if (isGuardEntry(event.state)) {
                return;
            }

            if (!guardEntryPushed.current || !hasUnsavedChanges()) {
                return;
            }

            pushGuardEntry();
            defer(() => {
                window.history.go(STEPS_BACK_ON_PROCEED);
            });
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, [defer, guardEntryPushed, hasUnsavedChanges]);
};
