import type { RootState } from "redux/store";

export const selectIsAuthed = (state: RootState) =>
    state.session.status === "authed";
export const selectIsChecking = (state: RootState) =>
    state.session.status === "checking";
