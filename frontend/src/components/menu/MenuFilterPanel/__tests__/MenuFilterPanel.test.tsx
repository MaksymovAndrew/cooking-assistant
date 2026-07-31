import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MenuFilterPanel } from "components/menu/MenuFilterPanel";

import type { MenuFilterState } from "utils/filters/menuFilterDefs";

import { renderWithRouter } from "test/router";

const CATEGORIES = [
    { menu_category_id: 1, category_name: "Lunch" },
    { menu_category_id: 2, category_name: "Dinner" },
];

const BASE_FILTERS: MenuFilterState = { search: "", categories: [] };

const setup = (overrides: Partial<MenuFilterState> = {}, activeCount = 0) => {
    const setValue = jest.fn();

    renderWithRouter(
        <MenuFilterPanel
            filters={{ ...BASE_FILTERS, ...overrides }}
            setValue={setValue}
            activeCount={activeCount}
            categories={CATEGORIES}
            searchPlaceholder="menu title"
            total={5}
        />,
    );

    return { setValue };
};

const openPanel = async () => {
    await userEvent.click(screen.getByRole("button", { name: /Filter/ }));
};

const DEBOUNCE_MS = 300;

const setupUser = () =>
    userEvent.setup({
        advanceTimers: (ms) => {
            jest.advanceTimersByTime(ms);
        },
    });

describe("MenuFilterPanel", () => {
    it("should render the search input with the given placeholder", () => {
        setup();

        expect(screen.getByPlaceholderText(/menu title/i)).toBeInTheDocument();
    });

    it("should not show the popover by default", () => {
        setup();

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should open the popover when the Filter trigger is clicked", async () => {
        setup();

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

        await openPanel();

        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should show a badge with the given active filter count", () => {
        setup({}, 1);

        expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("should submit the typed search term once the debounce settles", async () => {
        jest.useFakeTimers();
        const user = setupUser();

        try {
            const { setValue } = setup();

            await user.type(
                screen.getByPlaceholderText(/menu title/i),
                "brunch",
            );
            act(() => {
                jest.advanceTimersByTime(DEBOUNCE_MS);
            });

            expect(setValue).toHaveBeenCalledWith("search", "brunch", {
                replace: true,
            });
        } finally {
            jest.useRealTimers();
        }
    });

    it("should add the clicked category to the selection", async () => {
        const { setValue } = setup();

        await openPanel();
        await userEvent.click(screen.getByRole("checkbox", { name: "Lunch" }));

        expect(setValue).toHaveBeenCalledWith("categories", [1]);
    });

    it("should remove an already-selected category when its chip is clicked", async () => {
        const { setValue } = setup({ categories: [1, 2] });

        await openPanel();
        await userEvent.click(screen.getByRole("checkbox", { name: "Lunch" }));

        expect(setValue).toHaveBeenCalledWith("categories", [2]);
    });

    it("should reset only the categories when Reset filters is clicked, leaving search alone", async () => {
        const { setValue } = setup({ categories: [1, 2] }, 1);

        await openPanel();
        await userEvent.click(
            screen.getByRole("button", { name: "Reset filters" }),
        );

        expect(setValue).toHaveBeenCalledWith("categories", []);
    });

    it("should close the popover when the apply button is clicked", async () => {
        setup();

        await openPanel();
        await userEvent.click(
            screen.getByRole("button", { name: "Show 5 menus" }),
        );

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
});
