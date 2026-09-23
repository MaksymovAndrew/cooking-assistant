import type { RefObject } from "react";
import { useEffect } from "react";

import {
    isGuardEntry,
    pushGuardEntry,
    STEPS_BACK_ON_PROCEED,
} from "./guardHistoryEntry";

// the two ways out that never pass through the app's own links: closing the tab, and the back button
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
            // arriving on the duplicate entry itself, backwards or forwards: it carries the same
            // URL as its neighbour, so there is nothing to show and nothing to block
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
