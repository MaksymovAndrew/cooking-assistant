import { useAppSelector } from "redux/hooks";
import { selectIsAuthed } from "redux/selectors/sessionSelectors";
import { selectIsGuest } from "redux/selectors/viewerSelectors";

// held back during the session check, or it would go out as a guest's and flash the unfiltered list
export const useViewerFilterGate = (hasViewerFilter: boolean) => {
    const isAuthed = useAppSelector(selectIsAuthed);
    const isGuest = useAppSelector(selectIsGuest);
    const isAwaitingSession = hasViewerFilter && !isAuthed && !isGuest;

    return { isAuthed, isAwaitingSession };
};
