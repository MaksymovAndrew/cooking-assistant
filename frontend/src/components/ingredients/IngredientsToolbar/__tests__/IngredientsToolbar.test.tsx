import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { IngredientsToolbar } from "components/ingredients/IngredientsToolbar";

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
            />,
        );

        expect(
            screen.getByRole("button", { name: "Expiring soon (2)" }),
        ).toHaveClass("ingredients-toolbar__filter-pill--active");
    });
});
