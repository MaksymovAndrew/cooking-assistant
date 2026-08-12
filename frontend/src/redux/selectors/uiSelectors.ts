import type { ActiveModal } from "redux/slices/uiSlice";
import type { RootState } from "redux/store";

// only the head of the queue is ever rendered - the rest wait, they never stack
export const selectActiveModal = (state: RootState): ActiveModal | null =>
    state.ui.queue.length > 0 ? state.ui.queue[0] : null;
