import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as ReactRouterDom from "react-router-dom";

import { API_ROUTES } from "api/endpoints";

import { GuestLandingSearch } from "components/home/GuestLanding/GuestLandingSearch";

import { mockGetByUrl } from "test/apiClientMock";
import { mockNavigate, renderWithRouter } from "test/router";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual<typeof ReactRouterDom>("react-router-dom"),
    useNavigate: () => mockNavigate,
}));
jest.mock("api/client");

const SOUP_TYPE = { id: 3, type_name: "Soup", description: "" };

beforeEach(() => {
    mockGetByUrl({ [API_ROUTES.recipeTypes.list]: [SOUP_TYPE] });
});

describe("GuestLandingSearch", () => {
    it("should navigate to the recipe list with the typed term once the debounce settles", async () => {
        jest.useFakeTimers();
        const user = userEvent.setup({
            advanceTimers: (ms) => {
                jest.advanceTimersByTime(ms);
            },
        });

        try {
            renderWithRouter(<GuestLandingSearch />);

            await user.type(
                screen.getByPlaceholderText("Search recipes and menus"),
                "ragù",
            );

            expect(mockNavigate).not.toHaveBeenCalled();

            act(() => {
                jest.advanceTimersByTime(300);
            });

            expect(mockNavigate).toHaveBeenCalledWith(
                "/all-recipes?q=rag%C3%B9",
            );
        } finally {
            jest.useRealTimers();
        }
    });

    it("should link a real recipe type chip to the filtered recipe list", async () => {
        renderWithRouter(<GuestLandingSearch />);

        expect(
            await screen.findByRole("link", { name: "Soup" }),
        ).toHaveAttribute("href", "/all-recipes?types=3");
    });

    it("should link the All chip to the unfiltered recipe list", () => {
        renderWithRouter(<GuestLandingSearch />);

        expect(screen.getByRole("link", { name: "All" })).toHaveAttribute(
            "href",
            "/all-recipes",
        );
    });
});
