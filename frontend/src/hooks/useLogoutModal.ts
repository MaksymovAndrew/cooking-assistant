import { useAppDispatch } from "redux/hooks";
import { MODAL_TYPE, openModal } from "redux/slices/uiSlice";

// opens the shared logout-confirmation modal - used by both the desktop header and the mobile nav drawer
export const useLogoutModal = () => {
    const dispatch = useAppDispatch();

    return () => dispatch(openModal({ type: MODAL_TYPE.logout }));
};
