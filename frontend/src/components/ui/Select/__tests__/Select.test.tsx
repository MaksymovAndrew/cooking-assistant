import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Select } from "components/ui/Select";

describe("Select", () => {
    it("should call onChange when a new option is picked", async () => {
        const onChange = jest.fn();

        render(
            <Select aria-label="Recipe type" value="" onChange={onChange}>
                <option value="">Choose a type</option>
                <option value="1">Main course</option>
            </Select>,
        );

        await userEvent.selectOptions(
            screen.getByLabelText("Recipe type"),
            "1",
        );

        expect(onChange).toHaveBeenCalled();
    });

    it("should apply the error class when hasError is set", () => {
        render(
            <Select
                aria-label="Recipe type"
                hasError
                value=""
                onChange={jest.fn()}
            >
                <option value="">Choose a type</option>
            </Select>,
        );

        expect(screen.getByLabelText("Recipe type")).toHaveClass(
            "select--error",
        );
    });
});
