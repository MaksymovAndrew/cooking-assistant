import type { RootState } from "redux/store";

export const selectServerDataVersion = (state: RootState): number =>
    state.serverData.version;
