import { combineQueryStatus } from "utils/queryStatus";

const query = (isLoading: boolean, isError: boolean) => ({
    isLoading,
    isError,
    refetch: jest.fn(() => Promise.resolve(null)),
});

describe("combineQueryStatus", () => {
    it("should be loading while any query is", () => {
        expect(
            combineQueryStatus([query(false, false), query(true, false)])
                .isLoading,
        ).toBe(true);
    });

    it("should be settled with no queries at all", () => {
        expect(combineQueryStatus([])).toEqual(
            expect.objectContaining({ isLoading: false, isError: false }),
        );
    });

    it("should refetch only the queries that failed on retry", () => {
        const ok = query(false, false);
        const failed = query(false, true);
        const status = combineQueryStatus([ok, failed]);

        status.retry();

        expect(status.isError).toBe(true);
        expect(failed.refetch).toHaveBeenCalledTimes(1);
        expect(ok.refetch).not.toHaveBeenCalled();
    });

    it("should not count a failed refetch that still holds its data", () => {
        const stale = { ...query(false, true), data: [] };

        expect(combineQueryStatus([stale]).isError).toBe(false);
    });

    it("should swallow a refetch that rejects", async () => {
        const failed = {
            ...query(false, true),
            refetch: jest.fn(() => Promise.reject(new Error("offline"))),
        };

        combineQueryStatus([failed]).retry();
        await Promise.resolve();

        expect(failed.refetch).toHaveBeenCalledTimes(1);
    });
});
