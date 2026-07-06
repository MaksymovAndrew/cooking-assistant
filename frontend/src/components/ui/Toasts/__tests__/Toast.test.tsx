import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type {
    Notification,
    NotificationType,
} from "redux/slices/notificationsSlice";

import { Toast } from "components/ui/Toasts/Toast";

import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

const AUTO_DISMISS_MS = 4000;
const LEAVE_DURATION_MS = 280;

const TYPE_CLASSNAMES: Record<NotificationType, string> = {
    success: "toast--success",
    error: "toast--error",
    info: "toast--info",
};

const makeNotification = (type: NotificationType): Notification => ({
    id: "n1",
    type,
    message: "Boom",
});

describe("Toast", () => {
    it.each(Object.entries(TYPE_CLASSNAMES))(
        "should apply the %s variant class",
        (type, className) => {
            renderWithProviders(
                <Toast
                    notification={makeNotification(type as NotificationType)}
                />,
            );

            expect(screen.getByRole("status")).toHaveClass(className);
        },
    );

    it("should render the message", () => {
        renderWithProviders(
            <Toast notification={makeNotification("success")} />,
        );

        expect(screen.getByText("Boom")).toBeInTheDocument();
    });

    it("should start the leave animation when the dismiss button is clicked", async () => {
        renderWithProviders(
            <Toast notification={makeNotification("success")} />,
        );

        await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));

        expect(screen.getByRole("status")).toHaveClass("toast--leaving");
    });

    it("should auto-start the leave animation after the auto-dismiss timeout", () => {
        jest.useFakeTimers();

        try {
            renderWithProviders(
                <Toast notification={makeNotification("success")} />,
            );

            act(() => {
                jest.advanceTimersByTime(AUTO_DISMISS_MS);
            });

            expect(screen.getByRole("status")).toHaveClass("toast--leaving");
        } finally {
            jest.useRealTimers();
        }
    });

    it("should dispatch removeNotification once the leave animation finishes", () => {
        jest.useFakeTimers();

        try {
            const notification = makeNotification("success");
            const store = makeTestStore({
                notifications: { items: [notification] },
            });

            renderWithProviders(<Toast notification={notification} />, {
                store,
            });

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
});
