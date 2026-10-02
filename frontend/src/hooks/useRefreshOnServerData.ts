import { useEffect, useRef } from "react";

import { useAppSelector } from "redux/hooks";
import { selectServerDataVersion } from "redux/selectors/serverDataSelectors";

import { useAppRouter } from "./useAppRouter";

// for a page whose per-viewer data comes from the server render: a write elsewhere (a toast's undo,
// a modal) bumps the version, and the page asks the server for a fresh render
export const useRefreshOnServerData = (): void => {
    const version = useAppSelector(selectServerDataVersion);
    const { refresh } = useAppRouter();
    const seenVersion = useRef(version);

    useEffect(() => {
        if (version === seenVersion.current) {
            return;
        }

        seenVersion.current = version;
        refresh();
    }, [version, refresh]);
};
