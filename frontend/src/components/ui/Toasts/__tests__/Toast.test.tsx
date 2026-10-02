import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { API_ROUTES } from "api/endpoints";

import type {
    Notification,
    NotificationType,
} from "redux/slices/notificationsSlice";

import { Toast } from "components/ui/Toasts/Toast";

import { mockedPost } from "test/apiClientMock";
import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const AUTO_DISMISS_MS = 4000;
const ACTION_DISMISS_MS = 10000;
const LEAVE_DURATION_MS = 280;
const LEAVING_CLASS = "toast--leaving";

const TYPE_CLASSNAMES: Record<NotificationType, string> = {
    success: "toast--success",
    error: "toast--error",
    info: "toast--info",
};

const makeNotification = (type: NotificationType): Notification => ({
    id: "n1",
    type,
    message: "Boom",
    link: null,
    action: null,
});

const withUndo = (): Notification => ({
    ...makeNotification("success"),
    action: { kind: "undoCooking", consumptionId: 42, label: "Undo" },
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

    it("should render the follow-up link and start leaving once it is clicked", async () => {
        renderWithProviders(
            <Toast
                notification={{
                    ...makeNotification("success"),
                    link: { href: "/shopping-list", label: "Open list" },
                }}
            />,
        );

        const link = screen.getByRole("link", { name: "Open list" });

        expect(link).toHaveAttribute("href", "/shopping-list");

        await userEvent.click(link);

        expect(screen.getByRole("status")).toHaveClass(LEAVING_CLASS);
    });

    it("should start the leave animation when the dismiss button is clicked", async () => {
        renderWithProviders(
            <Toast notification={makeNotification("success")} />,
        );

        await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));

        expect(screen.getByRole("status")).toHaveClass(LEAVING_CLASS);
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

            expect(screen.getByRole("status")).toHaveClass(LEAVING_CLASS);
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

    it("should run the toast's action once and start leaving when its button is pressed", async () => {
        mockedPost.mockResolvedValue({ data: null });
        renderWithProviders(<Toast notification={withUndo()} />);

        await userEvent.click(screen.getByRole("button", { name: "Undo" }));

        expect(screen.getByRole("status")).toHaveClass(LEAVING_CLASS);
        expect(mockedPost).toHaveBeenCalledTimes(1);
        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.userIngredients.undoCook(42),
            undefined,
        );
    });

    it("should stay long enough to reach the action button", () => {
        jest.useFakeTimers();

        try {
            renderWithProviders(<Toast notification={withUndo()} />);

            act(() => {
                jest.advanceTimersByTime(AUTO_DISMISS_MS);
            });

            expect(screen.getByRole("status")).not.toHaveClass(LEAVING_CLASS);

            act(() => {
                jest.advanceTimersByTime(ACTION_DISMISS_MS - AUTO_DISMISS_MS);
            });

            expect(screen.getByRole("status")).toHaveClass(LEAVING_CLASS);
        } finally {
            jest.useRealTimers();
        }
    });
});
