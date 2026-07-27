import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { IngredientsToolbar } from "components/ingredients/IngredientsToolbar";

const NO_CATEGORIES: never[] = [];

describe("IngredientsToolbar", () => {
    it("should call onQueryChange as the search box is typed into", async () => {
        const onQueryChange = jest.fn();

        render(
            <IngredientsToolbar
                query=""
                onQueryChange={onQueryChange}
                expiringSoonCount={0}
                expiringSoonOnly={false}
                onToggleExpiringSoon={jest.fn()}
                categories={NO_CATEGORIES}
                categoryFilter={null}
                onCategoryFilterChange={jest.fn()}
            />,
        );

        await userEvent.type(
            screen.getByPlaceholderText("Search your pantry..."),
            "p",
        );

        expect(onQueryChange).toHaveBeenCalledWith("p");
    });

    it("should not show the expiring-soon filter pill when the count is zero", () => {
        render(
            <IngredientsToolbar
                query=""
                onQueryChange={jest.fn()}
                expiringSoonCount={0}
                expiringSoonOnly={false}
                onToggleExpiringSoon={jest.fn()}
                categories={NO_CATEGORIES}
                categoryFilter={null}
                onCategoryFilterChange={jest.fn()}
            />,
        );

        expect(
            screen.queryByRole("button", { name: /Expiring soon/ }),
        ).not.toBeInTheDocument();
    });

    it("should show the count and call onToggleExpiringSoon when the pill is clicked", async () => {
        const onToggleExpiringSoon = jest.fn();

        render(
            <IngredientsToolbar
                query=""
                onQueryChange={jest.fn()}
                expiringSoonCount={2}
                expiringSoonOnly={false}
                onToggleExpiringSoon={onToggleExpiringSoon}
                categories={NO_CATEGORIES}
                categoryFilter={null}
                onCategoryFilterChange={jest.fn()}
            />,
        );

        const pill = screen.getByRole("button", {
            name: "Expiring soon (2)",
        });

        await userEvent.click(pill);

        expect(onToggleExpiringSoon).toHaveBeenCalledTimes(1);
    });

    it("should mark the filter pill active when expiringSoonOnly is true", () => {
        render(
            <IngredientsToolbar
                query=""
                onQueryChange={jest.fn()}
                expiringSoonCount={2}
                expiringSoonOnly={true}
                onToggleExpiringSoon={jest.fn()}
                categories={NO_CATEGORIES}
                categoryFilter={null}
                onCategoryFilterChange={jest.fn()}
            />,
        );

        expect(
            screen.getByRole("button", { name: "Expiring soon (2)" }),
        ).toHaveClass("ingredients-toolbar__filter-pill--active");
    });

    it("should not show the category select when there are no categories", () => {
        render(
            <IngredientsToolbar
                query=""
                onQueryChange={jest.fn()}
                expiringSoonCount={0}
                expiringSoonOnly={false}
                onToggleExpiringSoon={jest.fn()}
                categories={NO_CATEGORIES}
                categoryFilter={null}
                onCategoryFilterChange={jest.fn()}
            />,
        );

        expect(
            screen.queryByRole("combobox", { name: "Filter by category" }),
        ).not.toBeInTheDocument();
    });

    it("should call onCategoryFilterChange when a category is selected", async () => {
        const onCategoryFilterChange = jest.fn();

        render(
            <IngredientsToolbar
                query=""
                onQueryChange={jest.fn()}
                expiringSoonCount={0}
                expiringSoonOnly={false}
                onToggleExpiringSoon={jest.fn()}
                categories={[
                    { key: "vegetables", label: "Vegetables", count: 2 },
                ]}
                categoryFilter={null}
                onCategoryFilterChange={onCategoryFilterChange}
            />,
        );

        await userEvent.selectOptions(
            screen.getByRole("combobox", { name: "Filter by category" }),
            "vegetables",
        );

        expect(onCategoryFilterChange).toHaveBeenCalledWith("vegetables");
    });
});
