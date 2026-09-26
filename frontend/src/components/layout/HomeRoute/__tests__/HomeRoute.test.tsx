import { screen } from "@testing-library/react";

import type { CurrentUser } from "types/auth";

import { HomeRoute } from "components/layout/HomeRoute";

import { mockedGet } from "test/apiClientMock";
import { renderWithRouter } from "test/router";

jest.mock("api/client");

const AUTHED = "Dashboard";
const GUEST = "Guest landing";
const HOME_PATH = "/";
const SESSION_ERROR = "Could not verify session. Please refresh the page.";

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

const renderHomeRoute = () =>
    renderWithRouter(
        <HomeRoute
            authedElement={<div>{AUTHED}</div>}
            guestElement={<div>{GUEST}</div>}
        />,
        [HOME_PATH],
    );

describe("HomeRoute", () => {
    it("should render the authed element when getMe resolves with a user", async () => {
        mockedGet.mockResolvedValue({ data: CURRENT_USER });

        renderHomeRoute();

        expect(await screen.findByText(AUTHED)).toBeInTheDocument();
        expect(screen.queryByText(GUEST)).not.toBeInTheDocument();
    });

    it("should render the guest element when getMe resolves with a null payload", async () => {
        mockedGet.mockResolvedValue({ data: null });

        renderHomeRoute();

        expect(await screen.findByText(GUEST)).toBeInTheDocument();
        expect(screen.queryByText(AUTHED)).not.toBeInTheDocument();
    });

    it("should show a session error when getMe rejects with a genuine failure", async () => {
        mockedGet.mockRejectedValue(new Error("Network error"));

        renderHomeRoute();

        expect(await screen.findByText(SESSION_ERROR)).toBeInTheDocument();
        expect(screen.queryByText(AUTHED)).not.toBeInTheDocument();
        expect(screen.queryByText(GUEST)).not.toBeInTheDocument();
    });
});
