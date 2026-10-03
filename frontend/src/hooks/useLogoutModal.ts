import { useAppDispatch } from "redux/hooks";
import { MODAL_TYPE, openModal } from "redux/slices/uiSlice";

export const useLogoutModal = () => {
    const dispatch = useAppDispatch();

    return () => dispatch(openModal({ type: MODAL_TYPE.logout }));
};
