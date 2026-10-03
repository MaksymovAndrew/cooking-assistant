import { createSlice } from "@reduxjs/toolkit";

// bumped by writes that change a server-rendered page, which has no RTK Query cache to invalidate
interface ServerDataState {
    version: number;
}

const initialState: ServerDataState = { version: 0 };

const serverDataSlice = createSlice({
    name: "serverData",
    initialState,
    reducers: {
        markServerDataStale: (state) => {
            state.version += 1;
        },
    },
});

export const { markServerDataStale } = serverDataSlice.actions;
export const serverDataReducer = serverDataSlice.reducer;
