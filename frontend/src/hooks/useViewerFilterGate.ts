import { useAppSelector } from "redux/hooks";
import { selectIsAuthed } from "redux/selectors/sessionSelectors";
import { selectIsGuest } from "redux/selectors/viewerSelectors";

// viewer-only filters (pantry, favourites) need a session. The caller drops a guest's; while the session
// check is still pending, a request carrying one is held back so it can't go out as a guest's and flash the
// unfiltered list under an already-active chip
export const useViewerFilterGate = (hasViewerFilter: boolean) => {
    const isAuthed = useAppSelector(selectIsAuthed);
    const isGuest = useAppSelector(selectIsGuest);
    const isAwaitingSession = hasViewerFilter && !isAuthed && !isGuest;

    return { isAuthed, isAwaitingSession };
};
