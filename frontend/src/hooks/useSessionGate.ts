import { useAppSelector } from "redux/hooks";
import {
    selectIsAuthed,
    selectIsChecking,
} from "redux/selectors/sessionSelectors";
import { selectIsGuest } from "redux/selectors/viewerSelectors";
import { useGetMeQuery } from "redux/services/authApi";

interface SessionGate {
    isChecking: boolean;
    isAuthed: boolean;
    isGuest: boolean;
}

// shared checking/authed/guest state machine behind HomeRoute and PrivateRoute's own outcomes
export const useSessionGate = (): SessionGate => {
    useGetMeQuery(null);

    return {
        isChecking: useAppSelector(selectIsChecking),
        isAuthed: useAppSelector(selectIsAuthed),
        isGuest: useAppSelector(selectIsGuest),
    };
};
