import { useEffect, useRef } from "react";

import { useAppSelector } from "redux/hooks";
import { selectServerDataVersion } from "redux/selectors/serverDataSelectors";

import { useAppRouter } from "./useAppRouter";

// a write elsewhere (a toast's undo, a modal) bumps the version; the server then re-renders the page
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
