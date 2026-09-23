// marks the duplicate history entry the back button is absorbed by
const GUARD_STATE_KEY = "unsavedChangesGuard";

// past the duplicate entry and past the one the user actually asked to leave
export const STEPS_BACK_ON_PROCEED = -2;

const readHistoryState = (): Record<string, unknown> => {
    const state: unknown = window.history.state;

    return typeof state === "object" && state !== null
        ? (state as Record<string, unknown>)
        : {};
};

export const isGuardEntry = (state: unknown): boolean =>
    typeof state === "object" && state !== null && GUARD_STATE_KEY in state;

// the router keeps its own bookkeeping in history.state, so the marker is added to it rather
// than replacing it - a blank entry would leave the router unable to restore this route
export const pushGuardEntry = () => {
    window.history.pushState(
        { ...readHistoryState(), [GUARD_STATE_KEY]: true },
        "",
        window.location.href,
    );
};

// an entry cannot be removed, but it can stop being a guard: once there is nothing to protect,
// the marker goes so a later back or forward onto it behaves like any other entry
export const clearGuardEntry = () => {
    if (!isGuardEntry(window.history.state)) {
        return;
    }

    const withoutMarker = Object.fromEntries(
        Object.entries(readHistoryState()).filter(
            ([key]) => key !== GUARD_STATE_KEY,
        ),
    );

    window.history.replaceState(withoutMarker, "", window.location.href);
};
