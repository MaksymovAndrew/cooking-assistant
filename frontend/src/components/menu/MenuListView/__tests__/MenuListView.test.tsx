import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PAGE_SIZE } from "constants/pagination";
import type { Menu } from "types/menu";

import { MenuListView } from "components/menu/MenuListView";

import type { MenuFilterState } from "utils/filters/menuFilterDefs";

import { renderWithRouter } from "test/router";

const MENU_TITLE = "Weekday menu";
const MINE_CLASS = "content-card--mine";

const MENUS: Menu[] = [
    {
        id: 1,
        title: MENU_TITLE,
        categoryname: "Lunch",
        menucontent: "quick",
        recipe_count: 4,
    },
];

const FILTERS: MenuFilterState = { search: "", categories: [] };

const baseProps = {
    filters: FILTERS,
    setValue: jest.fn(),
    resetFilters: jest.fn(),
    activeCount: 0,
    activeFilters: [],
    categories: [],
    heading: "All menus",
    subtitle: "1 menu published",
    emptyTitle: "No menus yet",
    emptyDescription: "Your menu collection is empty.",
    hasActiveFilters: false,
    searchPlaceholder: "menu title",
    onRetry: jest.fn(),
    total: MENUS.length,
    loadedCount: MENUS.length,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: jest.fn(),
    loadMoreError: null,
};

describe("MenuListView", () => {
    it("should render the heading, subtitle and a card per menu", () => {
        renderWithRouter(
            <MenuListView
                {...baseProps}
                menus={MENUS}
                noMenus={false}
                error={null}
            />,
        );

        expect(screen.getByText("All menus")).toBeInTheDocument();
        expect(screen.getByText("1 menu published")).toBeInTheDocument();
        expect(screen.getByText(MENU_TITLE)).toBeInTheDocument();
    });

    it("should render the translated New menu button, not a raw i18n key", () => {
        renderWithRouter(
            <MenuListView
                {...baseProps}
                menus={MENUS}
                noMenus={false}
                error={null}
            />,
        );

        expect(
            screen.getByRole("link", { name: "New menu" }),
        ).toBeInTheDocument();
    });

    it("should render the truly-empty title, description and create-first action when there are no active filters", () => {
        renderWithRouter(
            <MenuListView
                {...baseProps}
                menus={[]}
                noMenus={true}
                error={null}
            />,
        );

        expect(screen.getByText("No menus yet")).toBeInTheDocument();
        expect(
            screen.getByText("Your menu collection is empty."),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: /Create your first menu!/ }),
        ).toBeInTheDocument();
        expect(screen.queryByText(MENU_TITLE)).not.toBeInTheDocument();
    });

    it("should render the no-matches state and a working Clear filters button when filters are active", async () => {
        const resetFilters = jest.fn();

        renderWithRouter(
            <MenuListView
                {...baseProps}
                menus={[]}
                noMenus={true}
                error={null}
                hasActiveFilters={true}
                filters={{ ...FILTERS, search: "brunch" }}
                resetFilters={resetFilters}
            />,
        );

        expect(
            screen.getByText("No menus match your search"),
        ).toBeInTheDocument();
        expect(screen.getByText(/“brunch”/)).toBeInTheDocument();

        await userEvent.click(
            screen.getByRole("button", { name: "Clear filters" }),
        );

        expect(resetFilters).toHaveBeenCalledTimes(1);
    });

    it("should render the error state and call onRetry when Try again is clicked", async () => {
        const onRetry = jest.fn();

        renderWithRouter(
            <MenuListView
                {...baseProps}
                menus={[]}
                noMenus={false}
                error="Boom"
                onRetry={onRetry}
            />,
        );

        expect(screen.getByText("Boom")).toBeInTheDocument();

        await userEvent.click(
            screen.getByRole("button", { name: "Try again" }),
        );

        expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("should show the load more button and counter once total exceeds a page", () => {
        renderWithRouter(
            <MenuListView
                {...baseProps}
                menus={MENUS}
                noMenus={false}
                error={null}
                total={PAGE_SIZE + 1}
                hasNextPage={true}
            />,
        );

        expect(
            screen.getByText(`Showing ${MENUS.length} of ${PAGE_SIZE + 1}`),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Load more" }),
        ).toBeInTheDocument();
    });

    it("should call fetchNextPage when the load more button is clicked", async () => {
        const fetchNextPage = jest.fn();

        renderWithRouter(
            <MenuListView
                {...baseProps}
                menus={MENUS}
                noMenus={false}
                error={null}
                hasNextPage={true}
                fetchNextPage={fetchNextPage}
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Load more" }),
        );

        expect(fetchNextPage).toHaveBeenCalledTimes(1);
    });

    it("should render the load more error while keeping previously loaded menus", () => {
        renderWithRouter(
            <MenuListView
                {...baseProps}
                menus={MENUS}
                noMenus={false}
                error={null}
                hasNextPage={true}
                loadMoreError="Couldn't load more"
            />,
        );

        expect(screen.getByText(MENU_TITLE)).toBeInTheDocument();
        expect(screen.getByText("Couldn't load more")).toBeInTheDocument();
    });

    it("should mark cards as mine when the mine prop is set", () => {
        renderWithRouter(
            <MenuListView
                {...baseProps}
                menus={MENUS}
                noMenus={false}
                error={null}
                mine
            />,
        );

        expect(
            screen.getByRole("link", { name: new RegExp(MENU_TITLE) }),
        ).toHaveClass(MINE_CLASS);
    });

    it("should mark a card as mine when the server flags it as owned, even without the mine prop", () => {
        renderWithRouter(
            <MenuListView
                {...baseProps}
                menus={[{ ...MENUS[0], isOwner: true }]}
                noMenus={false}
                error={null}
            />,
        );

        expect(
            screen.getByRole("link", { name: new RegExp(MENU_TITLE) }),
        ).toHaveClass(MINE_CLASS);
    });

    it("should not mark another user's card as mine", () => {
        renderWithRouter(
            <MenuListView
                {...baseProps}
                menus={[{ ...MENUS[0], isOwner: false }]}
                noMenus={false}
                error={null}
            />,
        );

        expect(
            screen.getByRole("link", { name: new RegExp(MENU_TITLE) }),
        ).not.toHaveClass(MINE_CLASS);
    });
});
