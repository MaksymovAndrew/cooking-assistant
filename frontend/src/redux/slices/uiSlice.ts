import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice, nanoid } from "@reduxjs/toolkit";

import type { ActiveModal, ModalInput } from "redux/slices/uiSlice.modals";

export * from "redux/slices/uiSlice.modals";

interface UiState {
    // only queue[0] renders, so a second modal waits its turn instead of clobbering the first
    queue: ActiveModal[];
}

const initialState: UiState = { queue: [] };

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        openModal: {
            // a modal covers the screen, so a second one of the same type is an accidental double dispatch
            reducer: (state, action: PayloadAction<ActiveModal>) => {
                const isQueued = state.queue.some(
                    (modal) => modal.type === action.payload.type,
                );

                if (!isQueued) {
                    state.queue.push(action.payload);
                }
            },
            prepare: (modal: ModalInput) => ({
                payload: { id: nanoid(), ...modal },
            }),
        },
        closeModal: (state, action: PayloadAction<string>) => {
            state.queue = state.queue.filter(
                (modal) => modal.id !== action.payload,
            );
        },
    },
});

export const { openModal, closeModal } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
