import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Menu, MenuCategory } from "types/menu";

import { API_ROUTES } from "api/endpoints";

import { AllMenusView } from "app/[locale]/(public)/all-menus/AllMenusView";
import { mockGetByUrl } from "test/apiClientMock";
import { ROUTE_ALL_MENUS } from "test/constants";
import { renderWithProviders } from "test/router";

jest.mock("api/client");

const TITLE = "Weekday menu";
const CATEGORY_NAME = "Lunch";
const SAMPLE: Menu[] = [
    {
        id: 1,
        title: TITLE,
        categoryname: CATEGORY_NAME,
        menucontent: "quick",
        recipe_count: 4,
    },
];
const CATEGORIES: MenuCategory[] = [
    { menu_category_id: 3, category_name: CATEGORY_NAME },
];
const PAGE = { items: SAMPLE, total: SAMPLE.length };

describe("AllMenusView", () => {
    it("should render the menus loaded from the api", async () => {
        mockGetByUrl({
            [API_ROUTES.menu.list]: PAGE,
            [API_ROUTES.menuCategories.list]: [],
        });

        renderWithProviders(<AllMenusView />, {
            initialEntries: [ROUTE_ALL_MENUS],
        });

        expect(await screen.findByText(TITLE)).toBeInTheDocument();
    });

    it("should record the selected category and show the by-categories heading", async () => {
        mockGetByUrl({
            [API_ROUTES.menu.list]: PAGE,
            [API_ROUTES.menuCategories.list]: CATEGORIES,
        });

        renderWithProviders(<AllMenusView />, {
            initialEntries: [ROUTE_ALL_MENUS],
        });

        await userEvent.click(screen.getByRole("button", { name: "Filter" }));
        await userEvent.click(
            screen.getByRole("checkbox", { name: CATEGORY_NAME }),
        );

        expect(
            await screen.findByText(`Menus by categories: ${CATEGORY_NAME}`),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("checkbox", { name: CATEGORY_NAME }),
        ).toHaveAttribute("aria-checked", "true");
    });
});
