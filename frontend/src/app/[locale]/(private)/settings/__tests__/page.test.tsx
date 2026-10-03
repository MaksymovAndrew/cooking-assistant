import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { THEME_STORAGE_KEY } from "constants/theme";
import type { CurrentUser } from "types/auth";

import { API_ROUTES } from "api/endpoints";

import { ModalRoot } from "components/modals";

import SettingsPage from "app/[locale]/(private)/settings/page";
import { mockedGet, mockGetByUrl } from "test/apiClientMock";
import { renderWithProviders } from "test/router";

jest.mock("api/client");

const HOLD_MS = 500;
const LIGHT_THEME_DIALOG = "Switch to light theme?";
const CURRENT_USER: CurrentUser = {
    id: 1,
    name: "Claude",
    surname: "Cook",
    login: "claude",
    created_at: "2025-06-15T00:00:00.000Z",
    email: "claude@example.com",
    email_verified_at: null,
    avatar: null,
    avatar_photo_key: null,
    calorie_goal: null,
    locale: "en",
};

const renderPage = () =>
    renderWithProviders(
        <>
            <SettingsPage />
            <ModalRoot />
        </>,
    );

const setup = () => {
    mockGetByUrl({ [API_ROUTES.auth.me]: null });

    return renderPage();
};

describe("SettingsPage", () => {
    it("should ask before switching to a different theme", async () => {
        setup();

        await userEvent.click(screen.getByRole("radio", { name: "Light" }));

        expect(
            await screen.findByRole("dialog", { name: LIGHT_THEME_DIALOG }),
        ).toBeInTheDocument();
    });

    it("should not open a confirmation when the current theme is re-selected", async () => {
        localStorage.setItem(THEME_STORAGE_KEY, "dark");
        setup();

        await userEvent.click(screen.getByRole("radio", { name: "Dark" }));
        await userEvent.click(screen.getByRole("radio", { name: "Light" }));

        // a dialog queued by the first click would be showing in place of this one
        expect(
            await screen.findByRole("dialog", { name: LIGHT_THEME_DIALOG }),
        ).toBeInTheDocument();
    });

    it("should show a loading state until the account arrives", async () => {
        setup();

        expect(screen.getByRole("status", { name: "Loading…" })).toBeVisible();
        expect(
            await screen.findByRole("button", { name: "Change…" }),
        ).toBeInTheDocument();
        expect(screen.queryByRole("status", { name: "Loading…" })).toBeNull();
    });

    it("should show an error with a retry when the account cannot be loaded", async () => {
        mockGetByUrl({ [API_ROUTES.auth.me]: CURRENT_USER });
        mockedGet.mockRejectedValueOnce(new Error("offline"));

        renderPage();

        await userEvent.click(
            await screen.findByRole("button", { name: "Try again" }),
        );

        expect(await screen.findByText(CURRENT_USER.email)).toBeInTheDocument();
    });

    it("should open the change-password dialog", async () => {
        setup();

        await userEvent.click(
            await screen.findByRole("button", { name: "Change…" }),
        );

        expect(
            await screen.findByRole("dialog", { name: "Change password" }),
        ).toBeInTheDocument();
    });

    it("should ask before signing out on other devices", async () => {
        setup();

        await userEvent.click(
            await screen.findByRole("button", { name: "Sign out…" }),
        );

        expect(
            await screen.findByRole("dialog", {
                name: "Sign out on other devices",
            }),
        ).toBeInTheDocument();
    });

    it("should open the delete-account dialog after holding the delete button", async () => {
        jest.useFakeTimers();

        try {
            mockGetByUrl({ [API_ROUTES.auth.me]: CURRENT_USER });
            renderPage();

            const button = await screen.findByRole("button", {
                name: "Delete account",
            });

            fireEvent.pointerDown(button, { pointerId: 1 });
            act(() => {
                jest.advanceTimersByTime(HOLD_MS);
            });
            fireEvent.pointerUp(button, { pointerId: 1 });

            expect(
                await screen.findByRole("dialog", { name: "Delete account?" }),
            ).toBeInTheDocument();
        } finally {
            jest.useRealTimers();
        }
    });
});
