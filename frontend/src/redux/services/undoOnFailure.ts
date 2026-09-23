// an optimistic cache edit is rolled back if its request fails; the failure itself is toasted by
// the global listener, so it is swallowed here
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
