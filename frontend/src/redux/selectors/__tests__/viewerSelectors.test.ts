import {
    selectIsGuest,
    selectViewerCapabilities,
} from "redux/selectors/viewerSelectors";
import type { SessionStatus } from "redux/slices/sessionSlice";
import type { RootState } from "redux/store";

import { makeTestStore } from "test/store";

const makeState = (status: SessionStatus): RootState =>
    makeTestStore({ session: { status } }).getState();

describe("viewerSelectors", () => {
    describe("selectIsGuest", () => {
        it("should return true only when status is guest", () => {
            expect(selectIsGuest(makeState("guest"))).toBe(true);
        });

        it("should return false when status is not guest", () => {
            expect(selectIsGuest(makeState("authed"))).toBe(false);
            expect(selectIsGuest(makeState("checking"))).toBe(false);
            expect(selectIsGuest(makeState("error"))).toBe(false);
        });
    });

    describe("selectViewerCapabilities", () => {
        it("should grant every capability to an authed viewer", () => {
            expect(selectViewerCapabilities(makeState("authed"))).toEqual({
                canCreate: true,
                canFavourite: true,
                canEditOwn: true,
                canUsePantry: true,
            });
        });

        it("should deny every capability to a guest viewer", () => {
            expect(selectViewerCapabilities(makeState("guest"))).toEqual({
                canCreate: false,
                canFavourite: false,
                canEditOwn: false,
                canUsePantry: false,
            });
        });
    });
});
