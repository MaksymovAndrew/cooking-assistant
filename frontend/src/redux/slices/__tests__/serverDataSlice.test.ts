import {
    markServerDataStale,
    serverDataReducer,
} from "redux/slices/serverDataSlice";

describe("serverDataSlice", () => {
    it("should start at version zero", () => {
        expect(serverDataReducer(undefined, { type: "init" })).toEqual({
            version: 0,
        });
    });

    it("should bump the version each time the server data goes stale", () => {
        const once = serverDataReducer(undefined, markServerDataStale());

        expect(serverDataReducer(once, markServerDataStale())).toEqual({
            version: 2,
        });
    });
});
