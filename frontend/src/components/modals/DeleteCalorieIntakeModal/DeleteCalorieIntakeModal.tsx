import { useTranslation } from "react-i18next";

import { useAppDispatch } from "redux/hooks";
import { useDeleteCalorieIntakeMutation } from "redux/services/caloriesApi";
import { closeModal } from "redux/slices/uiSlice";

import { ConfirmModal } from "components/modals/ConfirmModal";

interface DeleteCalorieIntakeModalProps {
    modalId: string;
    intakeId: number;
    title: string;
}

export const DeleteCalorieIntakeModal = ({
    modalId,
    intakeId,
    title,
}: DeleteCalorieIntakeModalProps) => {
    const { t } = useTranslation("calories");
    const dispatch = useAppDispatch();
    const [deleteCalorieIntake, { isLoading }] =
        useDeleteCalorieIntakeMutation();

    const handleConfirm = async () => {
        // success and failure toasts are handled by the global listener
        const result = await deleteCalorieIntake(intakeId);

        if ("data" in result) {
            dispatch(closeModal(modalId));
        }
    };

    return (
        <ConfirmModal
            title={t("deleteModal.title")}
            message={t("deleteModal.message", { title })}
            isConfirmDisabled={isLoading}
            onClose={() => dispatch(closeModal(modalId))}
            onConfirm={() => void handleConfirm()}
        />
    );
};
