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

// spread, not replaced: the router keeps its own state there and must restore this route
export const pushGuardEntry = () => {
    window.history.pushState(
        { ...readHistoryState(), [GUARD_STATE_KEY]: true },
        "",
        window.location.href,
    );
};

// an entry can't be removed, only unmarked, so a later back onto it acts like any other
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
