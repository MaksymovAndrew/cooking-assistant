import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { HomeRoute } from "components/layout/HomeRoute";

import { mockedGet } from "test/apiClientMock";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const AUTHED = "Dashboard";
const GUEST = "Guest landing";
const HOME_PATH = "/";
const SESSION_ERROR = "Could not verify session. Please refresh the page.";

const makeAuthError = (status: number) =>
    Object.assign(new Error(), {
        isAxiosError: true,
        response: { status, data: { error: "Unauthorized" } },
    });

const renderHomeRoute = () =>
    render(
        <Provider store={makeTestStore()}>
            <MemoryRouter initialEntries={[HOME_PATH]}>
                <Routes>
                    <Route
                        path={HOME_PATH}
                        element={
                            <HomeRoute
                                authedElement={<div>{AUTHED}</div>}
                                guestElement={<div>{GUEST}</div>}
                            />
                        }
                    />
                </Routes>
            </MemoryRouter>
        </Provider>,
    );

describe("HomeRoute", () => {
    it("should render the authed element when getMe resolves", async () => {
        mockedGet.mockResolvedValue({ data: null });

        renderHomeRoute();

        expect(await screen.findByText(AUTHED)).toBeInTheDocument();
        expect(screen.queryByText(GUEST)).not.toBeInTheDocument();
    });

    it("should render the guest element when getMe rejects with 401", async () => {
        mockedGet.mockRejectedValue(makeAuthError(401));

        renderHomeRoute();

        expect(await screen.findByText(GUEST)).toBeInTheDocument();
        expect(screen.queryByText(AUTHED)).not.toBeInTheDocument();
    });

    it("should render the guest element when getMe rejects with 403", async () => {
        mockedGet.mockRejectedValue(makeAuthError(403));

        renderHomeRoute();

        expect(await screen.findByText(GUEST)).toBeInTheDocument();
    });

    it("should show a session error when getMe rejects with a non-auth error", async () => {
        mockedGet.mockRejectedValue(new Error("Network error"));

        renderHomeRoute();

        expect(await screen.findByText(SESSION_ERROR)).toBeInTheDocument();
        expect(screen.queryByText(AUTHED)).not.toBeInTheDocument();
        expect(screen.queryByText(GUEST)).not.toBeInTheDocument();
    });
});
