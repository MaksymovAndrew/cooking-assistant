import type { CurrentUser } from "types/auth";

import { fetchAsVisitor } from "api/server";

import { HomeRoute } from "components/layout/HomeRoute";

import { GuestLandingView } from "app/[locale]/(public)/GuestLandingView";
import { HomeDashboardView } from "app/[locale]/(public)/HomeDashboardView";
import HomePage from "app/[locale]/(public)/page";

jest.mock("api/server", () => ({ fetchAsVisitor: jest.fn() }));

const mockedFetch = fetchAsVisitor as jest.MockedFunction<
    typeof fetchAsVisitor
>;

const params = Promise.resolve({ locale: "en" });
const USER = { id: 1, login: "claude" } as CurrentUser;
const RECIPES = [{ id: 7, title: "Borscht" }];
const MENUS = [{ id: 3, title: "Weeknight soups" }];

// a guest; the lists answer by endpoint, whatever order they are asked in
const respondAsGuest = (menus: () => Promise<unknown>) => {
    mockedFetch.mockImplementation((path: string) => {
        if (path.startsWith("/api/recipes-by-filters")) {
            return Promise.resolve({ items: RECIPES, total: 1 });
        }

        return path.startsWith("/api/menu") ? menus() : Promise.resolve(null);
    });
};

describe("home page", () => {
    it("should render the dashboard for a visitor with a session", async () => {
        mockedFetch.mockResolvedValue(USER);

        expect((await HomePage({ params })).type).toBe(HomeDashboardView);
    });

    it("should render the landing for a visitor without one, with its lists already loaded", async () => {
        respondAsGuest(() => Promise.resolve({ items: MENUS, total: 1 }));

        const page = await HomePage({ params });

        expect(page.type).toBe(GuestLandingView);
        expect(page.props).toEqual({
            content: { recipes: RECIPES, menus: MENUS },
        });
        expect(mockedFetch).toHaveBeenCalledWith(
            "/api/recipes-by-filters?limit=4",
            "en",
        );
    });

    it("should leave a list the server could not load to the browser", async () => {
        respondAsGuest(() => Promise.reject(new Error("boom")));

        const page = await HomePage({ params });

        expect(page.props).toEqual({
            content: { recipes: RECIPES, menus: null },
        });
    });

    it("should let the browser decide when the api never answered", async () => {
        mockedFetch.mockRejectedValue(new Error("boom"));

        expect((await HomePage({ params })).type).toBe(HomeRoute);
    });
});
