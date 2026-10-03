import { EDIT_PAGE_STATE, resolveEditPageState } from "utils/editPageState";

const settled = { isLoading: false, isError: false, error: undefined };
const failed = (status: number) => ({
    isLoading: false,
    isError: true,
    error: { status, data: "x" },
});

describe("resolveEditPageState", () => {
    it("should wait while the record is loading", () => {
        expect(
            resolveEditPageState({ ...settled, isLoading: true }, null),
        ).toBe(EDIT_PAGE_STATE.loading);
    });

    it("should wait while there is no record yet", () => {
        expect(resolveEditPageState(settled, null)).toBe(
            EDIT_PAGE_STATE.loading,
        );
    });

    it("should offer the form for the viewer's own record", () => {
        expect(resolveEditPageState(settled, true)).toBe(EDIT_PAGE_STATE.ready);
    });

    it("should treat someone else's record as not found", () => {
        expect(resolveEditPageState(settled, false)).toBe(
            EDIT_PAGE_STATE.notFound,
        );
    });

    it("should treat a missing or malformed record as not found", () => {
        expect(resolveEditPageState(failed(404), null)).toBe(
            EDIT_PAGE_STATE.notFound,
        );
        expect(resolveEditPageState(failed(400), null)).toBe(
            EDIT_PAGE_STATE.notFound,
        );
    });

    it("should report any other failure as an error", () => {
        expect(resolveEditPageState(failed(500), null)).toBe(
            EDIT_PAGE_STATE.error,
        );
        expect(
            resolveEditPageState(
                { isLoading: false, isError: true, error: new Error("x") },
                null,
            ),
        ).toBe(EDIT_PAGE_STATE.error);
    });
});
