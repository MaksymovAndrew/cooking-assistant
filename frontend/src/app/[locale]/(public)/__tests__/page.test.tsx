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

describe("home page", () => {
    it("should render the dashboard for a visitor with a session", async () => {
        mockedFetch.mockResolvedValue(USER);

        expect((await HomePage({ params })).type).toBe(HomeDashboardView);
    });

    it("should render the landing for a visitor without one", async () => {
        mockedFetch.mockResolvedValue(null);

        expect((await HomePage({ params })).type).toBe(GuestLandingView);
    });

    it("should let the browser decide when the api never answered", async () => {
        mockedFetch.mockRejectedValue(new Error("boom"));

        expect((await HomePage({ params })).type).toBe(HomeRoute);
    });
});
