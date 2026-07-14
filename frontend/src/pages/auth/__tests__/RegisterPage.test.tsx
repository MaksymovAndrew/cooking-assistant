import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as ReactRouterDom from "react-router-dom";

import { API_ROUTES } from "api/endpoints";

import RegisterPage from "pages/auth/RegisterPage";
import { mockedPost } from "test/apiClientMock";
import { ROUTE_HOME } from "test/constants";
import { mockNavigate, renderWithRouter } from "test/router";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual<typeof ReactRouterDom>("react-router-dom"),
    useNavigate: () => mockNavigate,
}));
jest.mock("api/client");

const NAME = "Test";
const SURNAME = "User";
const LOGIN = "tester";
const EMAIL = "tester@example.com";
const PASSWORD = "secret1!";

describe("RegisterPage", () => {
    it("should register the user and navigate to the dashboard on submit", async () => {
        mockedPost.mockResolvedValue({ data: null });

        renderWithRouter(<RegisterPage />);

        await userEvent.type(screen.getByLabelText("Name:"), NAME);
        await userEvent.type(screen.getByLabelText("Surname:"), SURNAME);
        await userEvent.type(screen.getByLabelText("Username"), LOGIN);
        await userEvent.type(screen.getByLabelText("Email"), EMAIL);
        await userEvent.type(screen.getByLabelText("Password"), PASSWORD);
        await userEvent.click(screen.getByRole("button", { name: "Register" }));

        expect(mockedPost).toHaveBeenCalledWith(API_ROUTES.auth.register, {
            name: NAME,
            surname: SURNAME,
            login: LOGIN,
            email: EMAIL,
            password: PASSWORD,
        });
        expect(mockNavigate).toHaveBeenCalledWith(ROUTE_HOME);
    });
});
