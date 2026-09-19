import { useTranslation } from "react-i18next";

import { useAppDispatch } from "redux/hooks";
import { useDeleteTagMutation } from "redux/services/tagsApi";
import { closeModal } from "redux/slices/uiSlice";

import { ConfirmModal } from "components/modals/ConfirmModal";

interface DeleteTagModalProps {
    modalId: string;
    tagId: number;
    tagName: string;
}

export const DeleteTagModal = ({
    modalId,
    tagId,
    tagName,
}: DeleteTagModalProps) => {
    const { t } = useTranslation("tags");
    const dispatch = useAppDispatch();
    const [deleteTag, { isLoading }] = useDeleteTagMutation();

    const handleConfirm = async () => {
        // success and failure toasts are handled by the global listener
        const result = await deleteTag(tagId);

        if ("data" in result) {
            dispatch(closeModal(modalId));
        }
    };

    return (
        <ConfirmModal
            title={t("deleteModal.title")}
            message={t("deleteModal.message", { name: tagName })}
            isConfirmDisabled={isLoading}
            onClose={() => dispatch(closeModal(modalId))}
            onConfirm={() => void handleConfirm()}
        />
    );
};
