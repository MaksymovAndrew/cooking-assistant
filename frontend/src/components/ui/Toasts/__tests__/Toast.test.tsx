import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { API_ROUTES } from "api/endpoints";

import type { Notification } from "redux/slices/notificationsSlice";

import { Toast } from "components/ui/Toasts/Toast";

import { mockedPost } from "test/apiClientMock";
import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const AUTO_DISMISS_MS = 4000;
const ACTION_DISMISS_MS = 10000;
const LEAVE_DURATION_MS = 280;

const NOTIFICATION: Notification = {
    id: "n1",
    type: "success",
    message: "Boom",
    link: null,
    action: null,
};

const WITH_UNDO: Notification = {
    ...NOTIFICATION,
    action: { kind: "undoCooking", consumptionId: 42, label: "Undo" },
};

const setupUser = () =>
    userEvent.setup({
        advanceTimers: (ms) => {
            jest.advanceTimersByTime(ms);
        },
    });

const advance = (ms: number) => {
    act(() => {
        jest.advanceTimersByTime(ms);
    });
};

const renderToast = (notification: Notification) =>
    renderWithProviders(<Toast notification={notification} />, {
        store: makeTestStore({ notifications: { items: [notification] } }),
    });

describe("Toast", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("should render the follow-up link and dismiss the toast once it is clicked", async () => {
        const { store } = renderToast({
            ...NOTIFICATION,
            link: { href: "/shopping-list", label: "Open list" },
        });
        const link = screen.getByRole("link", { name: "Open list" });

        expect(link).toHaveAttribute("href", "/shopping-list");

        await setupUser().click(link);
        advance(LEAVE_DURATION_MS);

        expect(store.getState().notifications.items).toHaveLength(0);
    });

    it("should run the toast's action once and dismiss the toast when its button is pressed", async () => {
        mockedPost.mockResolvedValue({ data: null });
        const { store } = renderToast(WITH_UNDO);

        await setupUser().click(screen.getByRole("button", { name: "Undo" }));
        advance(LEAVE_DURATION_MS);

        // the undo adds its own confirmation toast, so only this one must be gone
        expect(store.getState().notifications.items).not.toContainEqual(
            WITH_UNDO,
        );
        expect(mockedPost).toHaveBeenCalledTimes(1);
        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.userIngredients.undoCook(42),
            undefined,
        );
    });

    it("should stay long enough to reach the action button", () => {
        const { store } = renderToast(WITH_UNDO);

        // two steps: the removal timer only starts once the leaving state has rendered
        advance(AUTO_DISMISS_MS);
        advance(LEAVE_DURATION_MS);

        expect(store.getState().notifications.items).toContainEqual(WITH_UNDO);

        advance(ACTION_DISMISS_MS - AUTO_DISMISS_MS - LEAVE_DURATION_MS);
        advance(LEAVE_DURATION_MS);

        expect(store.getState().notifications.items).toHaveLength(0);
    });
});
