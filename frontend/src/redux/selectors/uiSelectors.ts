import type { ActiveModal } from "redux/slices/uiSlice";
import type { RootState } from "redux/store";

export const selectActiveModal = (state: RootState): ActiveModal | null =>
    state.ui.queue.length > 0 ? state.ui.queue[0] : null;
