import {
    selectHasSessionError,
    selectIsAuthed,
    selectIsChecking,
    selectSessionStatus,
} from "redux/selectors/sessionSelectors";
import type { SessionStatus } from "redux/slices/sessionSlice";
import type { RootState } from "redux/store";

import { makeTestStore } from "test/store";

// build a real RootState (incl. the RTK Query slice) and seed just the session
const makeState = (status: SessionStatus): RootState =>
    makeTestStore({ session: { status } }).getState();

const authed: SessionStatus = "authed";
const guest: SessionStatus = "guest";
const checking: SessionStatus = "checking";
const error: SessionStatus = "error";

describe("sessionSelectors", () => {
    describe("selectSessionStatus", () => {
        it("should return the current session status", () => {
            expect(selectSessionStatus(makeState(authed))).toBe(authed);
            expect(selectSessionStatus(makeState(guest))).toBe(guest);
            expect(selectSessionStatus(makeState(checking))).toBe(checking);
            expect(selectSessionStatus(makeState(error))).toBe(error);
        });
    });

    describe("selectIsAuthed", () => {
        it("should return true only when status is authed", () => {
            expect(selectIsAuthed(makeState(authed))).toBe(true);
        });

        it("should return false when status is not authed", () => {
            expect(selectIsAuthed(makeState(guest))).toBe(false);
            expect(selectIsAuthed(makeState(checking))).toBe(false);
            expect(selectIsAuthed(makeState(error))).toBe(false);
        });
    });

    describe("selectIsChecking", () => {
        it("should return true only when status is checking", () => {
            expect(selectIsChecking(makeState(checking))).toBe(true);
        });

        it("should return false when status is not checking", () => {
            expect(selectIsChecking(makeState(authed))).toBe(false);
            expect(selectIsChecking(makeState(guest))).toBe(false);
            expect(selectIsChecking(makeState(error))).toBe(false);
        });
    });

    describe("selectHasSessionError", () => {
        it("should return true only when status is error", () => {
            expect(selectHasSessionError(makeState(error))).toBe(true);
        });

        it("should return false when there is no session error", () => {
            expect(selectHasSessionError(makeState(authed))).toBe(false);
            expect(selectHasSessionError(makeState(guest))).toBe(false);
            expect(selectHasSessionError(makeState(checking))).toBe(false);
        });
    });
});
