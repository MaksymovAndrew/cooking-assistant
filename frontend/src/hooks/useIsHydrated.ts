import { useSyncExternalStore } from "react";

const subscribe = () => () => undefined;

// false on the server and the first client render, so browser-only reads cannot mismatch
export const useIsHydrated = (): boolean =>
    useSyncExternalStore(
        subscribe,
        () => true,
        () => false,
    );
