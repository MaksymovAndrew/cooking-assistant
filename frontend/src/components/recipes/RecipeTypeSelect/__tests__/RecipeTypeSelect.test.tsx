import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RecipeTypeSelect } from "components/recipes/RecipeTypeSelect";

const TYPES = [{ id: 1, type_name: "Soup", description: "" }];

describe("RecipeTypeSelect", () => {
    it("should call onChange with the numeric id when a type is selected", async () => {
        const onChange = jest.fn();

        render(
            <RecipeTypeSelect
                id="recipe-type"
                label="Recipe Type"
                placeholder="Select recipe type"
                types={TYPES}
                value={null}
                error={null}
                onChange={onChange}
            />,
        );

        await userEvent.selectOptions(screen.getByRole("combobox"), "1");

        expect(onChange).toHaveBeenCalledWith(1);
    });

    it("should call onChange with null when the selection is cleared", () => {
        const onChange = jest.fn();

        render(
            <RecipeTypeSelect
                id="recipe-type"
                label="Recipe Type"
                placeholder="Select recipe type"
                types={TYPES}
                value={1}
                error={null}
                onChange={onChange}
            />,
        );

        fireEvent.change(screen.getByRole("combobox"), {
            target: { value: "" },
        });

        expect(onChange).toHaveBeenCalledWith(null);
    });
});
