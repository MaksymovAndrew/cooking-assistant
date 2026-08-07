import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

import type { CurrentUser } from "types/auth";

import { PrivateRoute } from "components/layout/PrivateRoute";

import type { LoginRedirectState } from "utils/loginRedirect";

import { mockedGet } from "test/apiClientMock";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const PROTECTED = "Protected content";
const LOGIN = "Login page";
const PROTECTED_PATH = "/protected";
const LOGIN_PATH = "/login";
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
    calorie_goal: null,
};

// stands in for LoginPage to assert the redirect carries the guest's intended destination
function LoginPageStub() {
    const location = useLocation();
    const state = location.state as LoginRedirectState | null;

    return <div>{state?.from?.pathname ?? "none"}</div>;
}

const renderWithChildren = () =>
    render(
        <Provider store={makeTestStore()}>
            <MemoryRouter initialEntries={[PROTECTED_PATH]}>
                <Routes>
                    <Route
                        path={PROTECTED_PATH}
                        element={
                            <PrivateRoute>
                                <div>{PROTECTED}</div>
                            </PrivateRoute>
                        }
                    />
                    <Route path={LOGIN_PATH} element={<div>{LOGIN}</div>} />
                </Routes>
            </MemoryRouter>
        </Provider>,
    );

describe("PrivateRoute", () => {
    it("should render children when getMe resolves with a user", async () => {
        mockedGet.mockResolvedValue({ data: CURRENT_USER });

        renderWithChildren();

        expect(await screen.findByText(PROTECTED)).toBeInTheDocument();
    });

    it("should render the nested outlet when no children are given", async () => {
        mockedGet.mockResolvedValue({ data: CURRENT_USER });

        render(
            <Provider store={makeTestStore()}>
                <MemoryRouter initialEntries={[PROTECTED_PATH]}>
                    <Routes>
                        <Route element={<PrivateRoute />}>
                            <Route
                                path={PROTECTED_PATH}
                                element={<div>{PROTECTED}</div>}
                            />
                        </Route>
                        <Route path={LOGIN_PATH} element={<div>{LOGIN}</div>} />
                    </Routes>
                </MemoryRouter>
            </Provider>,
        );

        expect(await screen.findByText(PROTECTED)).toBeInTheDocument();
    });

    it("should redirect to login when getMe resolves with a null payload (guest)", async () => {
        mockedGet.mockResolvedValue({ data: null });

        renderWithChildren();

        expect(await screen.findByText(LOGIN)).toBeInTheDocument();
        expect(screen.queryByText(PROTECTED)).not.toBeInTheDocument();
    });

    it("should carry the page the guest was trying to reach on the redirect to login", async () => {
        mockedGet.mockResolvedValue({ data: null });

        render(
            <Provider store={makeTestStore()}>
                <MemoryRouter initialEntries={[PROTECTED_PATH]}>
                    <Routes>
                        <Route
                            path={PROTECTED_PATH}
                            element={
                                <PrivateRoute>
                                    <div>{PROTECTED}</div>
                                </PrivateRoute>
                            }
                        />
                        <Route path={LOGIN_PATH} element={<LoginPageStub />} />
                    </Routes>
                </MemoryRouter>
            </Provider>,
        );

        expect(await screen.findByText(PROTECTED_PATH)).toBeInTheDocument();
    });

    it("should show a session error when getMe rejects with a genuine failure", async () => {
        mockedGet.mockRejectedValue(new Error("Network error"));

        renderWithChildren();

        expect(await screen.findByText(SESSION_ERROR)).toBeInTheDocument();
        expect(screen.queryByText(PROTECTED)).not.toBeInTheDocument();
        expect(screen.queryByText(LOGIN)).not.toBeInTheDocument();
    });
});
