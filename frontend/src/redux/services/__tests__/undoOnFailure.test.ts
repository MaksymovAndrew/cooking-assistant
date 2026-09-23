import { undoOnFailure } from "redux/services/undoOnFailure";

describe("undoOnFailure", () => {
    it("should keep the optimistic edit when the request succeeds", async () => {
        const patch = { undo: jest.fn() };

        await undoOnFailure(patch, Promise.resolve());

        expect(patch.undo).not.toHaveBeenCalled();
    });

    it("should roll the optimistic edit back when the request fails", async () => {
        const patch = { undo: jest.fn() };

        await undoOnFailure(patch, Promise.reject(new Error("offline")));

        expect(patch.undo).toHaveBeenCalledTimes(1);
    });
});
