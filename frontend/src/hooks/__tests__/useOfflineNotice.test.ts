import { act } from "@testing-library/react";

import { selectActiveModal } from "redux/selectors/uiSelectors";
import { closeModal, MODAL_TYPE } from "redux/slices/uiSlice";

import { useOfflineNotice } from "hooks/useOfflineNotice";

import { makeTestStore, renderHookWithStore } from "test/store";

const setNavigatorOnLine = (value: boolean) => {
    Object.defineProperty(navigator, "onLine", {
        configurable: true,
        value,
    });
};

const goOffline = () => {
    act(() => {
        window.dispatchEvent(new Event("offline"));
    });
};

const goOnline = () => {
    act(() => {
        window.dispatchEvent(new Event("online"));
    });
};

const setup = () =>
    renderHookWithStore(() => {
        useOfflineNotice();
    }, makeTestStore());

describe("useOfflineNotice", () => {
    afterEach(() => {
        setNavigatorOnLine(true);
    });

    it("should not open a modal while online", () => {
        const { store } = setup();

        expect(selectActiveModal(store.getState())).toBeNull();
    });

    it("should open the offline modal when the app starts offline", () => {
        setNavigatorOnLine(false);

        const { store } = setup();

        expect(selectActiveModal(store.getState())).toMatchObject({
            type: MODAL_TYPE.offline,
        });
    });

    it("should open the offline modal when connectivity drops", () => {
        const { store } = setup();

        goOffline();

        expect(selectActiveModal(store.getState())).toMatchObject({
            type: MODAL_TYPE.offline,
        });
    });

    it("should withdraw the modal when connectivity returns", () => {
        const { store } = setup();

        goOffline();
        goOnline();

        expect(selectActiveModal(store.getState())).toBeNull();
    });

    it("should not reopen the modal while still offline after it was dismissed", () => {
        const { store } = setup();

        goOffline();

        const opened = selectActiveModal(store.getState());

        act(() => {
            store.dispatch(closeModal(opened?.id ?? ""));
        });

        goOffline();

        expect(selectActiveModal(store.getState())).toBeNull();
    });

    it("should open again on a fresh drop after a previous dismiss", () => {
        const { store } = setup();

        goOffline();

        const opened = selectActiveModal(store.getState());

        act(() => {
            store.dispatch(closeModal(opened?.id ?? ""));
        });

        goOnline();
        goOffline();

        expect(selectActiveModal(store.getState())).toMatchObject({
            type: MODAL_TYPE.offline,
        });
    });

    it("should queue behind a modal that is already showing instead of replacing it", () => {
        const store = makeTestStore({
            ui: { queue: [{ id: "m1", type: MODAL_TYPE.logout }] },
        });

        renderHookWithStore(() => {
            useOfflineNotice();
        }, store);

        goOffline();

        expect(selectActiveModal(store.getState())).toMatchObject({
            type: MODAL_TYPE.logout,
        });

        act(() => {
            store.dispatch(closeModal("m1"));
        });

        expect(selectActiveModal(store.getState())).toMatchObject({
            type: MODAL_TYPE.offline,
        });
    });
});
