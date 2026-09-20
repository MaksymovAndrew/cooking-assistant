import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice, nanoid } from "@reduxjs/toolkit";

import type { ActiveModal, ModalInput } from "redux/slices/uiSlice.modals";

export * from "redux/slices/uiSlice.modals";

interface UiState {
    // FIFO: openModal enqueues, closeModal dequeues - only queue[0] is ever rendered, so a second
    // modal opened while one is showing waits its turn instead of clobbering the first
    queue: ActiveModal[];
}

const initialState: UiState = { queue: [] };

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        openModal: {
            // a modal covers the screen, so a second one of the same type is always an accidental
            // double dispatch (double-clicked delete button), never a real second request
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
