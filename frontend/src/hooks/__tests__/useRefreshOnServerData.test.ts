import { act } from "@testing-library/react";

import { markServerDataStale } from "redux/slices/serverDataSlice";

import { useRefreshOnServerData } from "hooks/useRefreshOnServerData";

import { mockRefresh } from "test/nextNavigationMock";
import { renderHookWithStore } from "test/store";

describe("useRefreshOnServerData", () => {
    it("should not refresh the page on its first render", () => {
        renderHookWithStore(() => {
            useRefreshOnServerData();
        });

        expect(mockRefresh).not.toHaveBeenCalled();
    });

    it("should refresh the page once per stale mark", () => {
        const { store } = renderHookWithStore(() => {
            useRefreshOnServerData();
        });

        act(() => {
            store.dispatch(markServerDataStale());
        });
        act(() => {
            store.dispatch(markServerDataStale());
        });

        expect(mockRefresh).toHaveBeenCalledTimes(2);
    });
});
