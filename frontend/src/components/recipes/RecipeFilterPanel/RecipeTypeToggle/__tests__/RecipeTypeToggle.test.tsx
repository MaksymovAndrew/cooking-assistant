import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RecipeTypeToggle } from "components/recipes/RecipeFilterPanel/RecipeTypeToggle";

describe("RecipeTypeToggle", () => {
    it("should render unchecked when not selected", () => {
        render(
            <RecipeTypeToggle
                label="Soup"
                selected={false}
                onToggle={jest.fn()}
            />,
        );

        expect(screen.getByRole("checkbox", { name: "Soup" })).toHaveAttribute(
            "aria-checked",
            "false",
        );
    });

    it("should render checked when selected", () => {
        render(<RecipeTypeToggle label="Soup" selected onToggle={jest.fn()} />);

        expect(screen.getByRole("checkbox", { name: "Soup" })).toHaveAttribute(
            "aria-checked",
            "true",
        );
    });

    it("should call onToggle when clicked", async () => {
        const onToggle = jest.fn();

        render(
            <RecipeTypeToggle
                label="Soup"
                selected={false}
                onToggle={onToggle}
            />,
        );

        await userEvent.click(screen.getByRole("checkbox", { name: "Soup" }));

        expect(onToggle).toHaveBeenCalledTimes(1);
    });
});
