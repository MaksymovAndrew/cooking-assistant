import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { API_ROUTES } from "api/endpoints";

import { MODAL_TYPE } from "redux/slices/uiSlice";

import { AppHeader } from "components/layout/AppHeader";

import { mockedGet, mockGetByUrl } from "test/apiClientMock";
import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("api/client");

describe("AppHeader", () => {
    it("should open the logout confirmation modal when the logout menu item is clicked", async () => {
        mockGetByUrl({
            [API_ROUTES.auth.me]: {
                id: 1,
                name: "Claude",
                surname: "Cook",
                login: "claude",
            },
        });

        const { store } = renderWithProviders(<AppHeader />);

        await userEvent.click(
            screen.getByRole("button", { name: "Account menu" }),
        );
        await userEvent.click(screen.getByRole("menuitem", { name: "Logout" }));

        expect(store.getState().ui.modal).toEqual(
            expect.objectContaining({ type: MODAL_TYPE.logout }),
        );
    });

    it("should show the current user's initials in the avatar once loaded", async () => {
        mockGetByUrl({
            [API_ROUTES.auth.me]: {
                id: 1,
                name: "Claude",
                surname: "Cook",
                login: "claude",
            },
        });

        renderWithProviders(<AppHeader />);

        expect(await screen.findByText("CC")).toBeInTheDocument();
    });

    it("should show Log In and Register links instead of the account menu for a guest", () => {
        renderWithProviders(<AppHeader />, {
            store: makeTestStore({ session: { status: "guest" } }),
        });

        expect(screen.getByRole("link", { name: "Log In" })).toHaveAttribute(
            "href",
            "/login",
        );
        expect(screen.getByRole("link", { name: "Register" })).toHaveAttribute(
            "href",
            "/registration",
        );
        expect(
            screen.queryByRole("button", { name: "Account menu" }),
        ).not.toBeInTheDocument();
    });

    it("should not fire its own /api/me request once the session is definitively guest", () => {
        renderWithProviders(<AppHeader />, {
            store: makeTestStore({ session: { status: "guest" } }),
        });

        expect(mockedGet).not.toHaveBeenCalledWith(
            API_ROUTES.auth.me,
            expect.anything(),
        );
    });
});
