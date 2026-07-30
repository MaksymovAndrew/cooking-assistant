import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FilterChipGroup } from "components/ui/FilterChipGroup";

const OPTIONS = [
    { id: 1, label: "Soup" },
    { id: 2, label: "Dessert" },
];

describe("FilterChipGroup", () => {
    it("should mark only the selected options as checked", () => {
        render(
            <FilterChipGroup
                options={OPTIONS}
                value={[2]}
                onChange={jest.fn()}
            />,
        );

        expect(screen.getByRole("checkbox", { name: "Soup" })).toHaveAttribute(
            "aria-checked",
            "false",
        );
        expect(
            screen.getByRole("checkbox", { name: "Dessert" }),
        ).toHaveAttribute("aria-checked", "true");
    });

    it("should add the clicked option to the selection", async () => {
        const onChange = jest.fn();

        render(
            <FilterChipGroup
                options={OPTIONS}
                value={[2]}
                onChange={onChange}
            />,
        );

        await userEvent.click(screen.getByRole("checkbox", { name: "Soup" }));

        expect(onChange).toHaveBeenCalledWith([2, 1]);
    });

    it("should remove the clicked option when it is already selected", async () => {
        const onChange = jest.fn();

        render(
            <FilterChipGroup
                options={OPTIONS}
                value={[1, 2]}
                onChange={onChange}
            />,
        );

        await userEvent.click(screen.getByRole("checkbox", { name: "Soup" }));

        expect(onChange).toHaveBeenCalledWith([2]);
    });
});
