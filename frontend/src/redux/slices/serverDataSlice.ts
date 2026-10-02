import { createSlice } from "@reduxjs/toolkit";

// a write that changes what a server-rendered page shows bumps this; the page re-renders on the server
// when it sees the bump, since such a page has no RTK Query cache entry to invalidate
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
