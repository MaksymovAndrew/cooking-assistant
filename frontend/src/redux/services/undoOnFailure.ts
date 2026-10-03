// the global listener toasts the failure, so it is swallowed here once the edit is undone
export const undoOnFailure = async (
    patch: { undo: () => void },
    queryFulfilled: Promise<unknown>,
): Promise<void> => {
    try {
        await queryFulfilled;
    } catch {
        patch.undo();
    }
};
