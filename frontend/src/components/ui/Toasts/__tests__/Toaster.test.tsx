import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Notification } from "redux/slices/notificationsSlice";

import { Toaster } from "components/ui/Toasts/Toaster";

import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

const AUTO_DISMISS_MS = 4000;
const LEAVE_DURATION_MS = 280;

const seeded = (message: string): { items: Notification[] } => ({
    items: [{ id: "n1", type: "error", message }],
});

describe("Toaster", () => {
    it("should render nothing when there are no notifications", () => {
        const { container } = renderWithProviders(<Toaster />, {
            store: makeTestStore(),
        });

        expect(container).toBeEmptyDOMElement();
    });

    it("should render a notification message", () => {
        renderWithProviders(<Toaster />, {
            store: makeTestStore({ notifications: seeded("Boom") }),
        });

        expect(screen.getByText("Boom")).toBeInTheDocument();
    });

    it("should dismiss a notification when its dismiss button is clicked", async () => {
        jest.useFakeTimers();
        const user = userEvent.setup({
            advanceTimers: (ms) => {
                jest.advanceTimersByTime(ms);
            },
        });
        const store = makeTestStore({ notifications: seeded("Boom") });

        try {
            renderWithProviders(<Toaster />, { store });

            await user.click(screen.getByRole("button", { name: "Dismiss" }));

            act(() => {
                jest.advanceTimersByTime(LEAVE_DURATION_MS);
            });

            expect(store.getState().notifications.items).toHaveLength(0);
        } finally {
            jest.useRealTimers();
        }
    });

    it("should auto-dismiss a notification after the timeout", () => {
        jest.useFakeTimers();
        const store = makeTestStore({ notifications: seeded("Boom") });

        try {
            renderWithProviders(<Toaster />, { store });

            act(() => {
                jest.advanceTimersByTime(AUTO_DISMISS_MS);
            });
            act(() => {
                jest.advanceTimersByTime(LEAVE_DURATION_MS);
            });

            expect(store.getState().notifications.items).toHaveLength(0);
        } finally {
            jest.useRealTimers();
        }
    });

    it("should render at most 3 toasts at a time", () => {
        const store = makeTestStore({
            notifications: {
                items: [
                    { id: "n1", type: "info", message: "One" },
                    { id: "n2", type: "info", message: "Two" },
                    { id: "n3", type: "info", message: "Three" },
                    { id: "n4", type: "info", message: "Four" },
                ],
            },
        });

        renderWithProviders(<Toaster />, { store });

        expect(screen.getByText("One")).toBeInTheDocument();
        expect(screen.getByText("Three")).toBeInTheDocument();
        expect(screen.queryByText("Four")).not.toBeInTheDocument();
    });
});
