import { render, screen } from "@testing-library/react";

import { NumberInput } from "components/ui/NumberInput";

describe("NumberInput", () => {
    it("should render as a number input", () => {
        render(
            <NumberInput
                aria-label="Servings"
                value={4}
                onChange={jest.fn()}
            />,
        );

        expect(screen.getByLabelText("Servings")).toHaveAttribute(
            "type",
            "number",
        );
    });

    it("should apply the error class when hasError is set", () => {
        render(
            <NumberInput
                aria-label="Servings"
                hasError
                value={4}
                onChange={jest.fn()}
            />,
        );

        expect(screen.getByLabelText("Servings")).toHaveClass(
            "number-input--error",
        );
    });
});
