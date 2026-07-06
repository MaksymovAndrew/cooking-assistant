import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { MenuCategoryToggle } from "components/menu/MenuFilterPanel/MenuCategoryToggle";

describe("MenuCategoryToggle", () => {
    it("should render unchecked when not selected", () => {
        render(
            <MenuCategoryToggle
                label="Lunch"
                selected={false}
                onToggle={jest.fn()}
            />,
        );

        expect(screen.getByRole("checkbox", { name: "Lunch" })).toHaveAttribute(
            "aria-checked",
            "false",
        );
    });

    it("should call onToggle when clicked", async () => {
        const onToggle = jest.fn();

        render(
            <MenuCategoryToggle
                label="Lunch"
                selected={false}
                onToggle={onToggle}
            />,
        );

        await userEvent.click(screen.getByRole("checkbox", { name: "Lunch" }));

        expect(onToggle).toHaveBeenCalledTimes(1);
    });
});
