import type { RefObject } from "react";
import { useEffect } from "react";

import { APP_ROOT_ID, MAIN_CONTENT_ID } from "constants/landmarks";

// module-level, so the page stays inert until the last open dialog closes
let openDialogs = 0;

export const useDialogFocus = (
    containerRef: RefObject<HTMLElement | null>,
): void => {
    useEffect(() => {
        const opener = document.activeElement;
        const appRoot = document.getElementById(APP_ROOT_ID);

        openDialogs += 1;
        appRoot?.setAttribute("inert", "");
        containerRef.current?.focus();

        return () => {
            openDialogs -= 1;

            if (openDialogs === 0) {
                appRoot?.removeAttribute("inert");
            }

            // the opener may have gone with the dialog's action (a deleted row, a closed menu)
            if (opener instanceof HTMLElement && opener.isConnected) {
                opener.focus();

                return;
            }

            document.getElementById(MAIN_CONTENT_ID)?.focus();
        };
    }, [containerRef]);
};
