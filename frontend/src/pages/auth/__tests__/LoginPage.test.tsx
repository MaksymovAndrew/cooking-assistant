import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as ReactRouterDom from "react-router-dom";

import { API_ROUTES } from "api/endpoints";

import LoginPage from "pages/auth/LoginPage";
import { mockedPost } from "test/apiClientMock";
import { ROUTE_HOME } from "test/constants";
import { mockNavigate, renderWithRouter } from "test/router";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual<typeof ReactRouterDom>("react-router-dom"),
    useNavigate: () => mockNavigate,
}));
jest.mock("api/client");

const USERNAME = "test-user";
const PASSWORD = "test-pass";

describe("LoginPage", () => {
    it("should navigate home on successful login", async () => {
        mockedPost.mockResolvedValue({ data: null });

        renderWithRouter(<LoginPage />);

        await userEvent.type(screen.getByLabelText("Username"), USERNAME);
        await userEvent.type(screen.getByLabelText("Password"), PASSWORD);
        await userEvent.click(screen.getByRole("button", { name: "Log In" }));

        expect(mockedPost).toHaveBeenCalledWith(API_ROUTES.auth.login, {
            login: USERNAME,
            password: PASSWORD,
        });
        expect(mockNavigate).toHaveBeenCalledWith(ROUTE_HOME, {
            replace: true,
        });
    });
});
