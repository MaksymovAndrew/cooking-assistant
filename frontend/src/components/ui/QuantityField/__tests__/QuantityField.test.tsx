import { render, screen } from "@testing-library/react";

import { FormField } from "components/ui/FormField";
import { QuantityField } from "components/ui/QuantityField";

describe("QuantityField", () => {
    it("should show the unit beside the amount its label names", () => {
        render(
            <FormField label="How much to add" htmlFor="quantity">
                <QuantityField
                    id="quantity"
                    unit="g"
                    value="250"
                    onChange={jest.fn()}
                />
            </FormField>,
        );

        expect(
            screen.getByRole("spinbutton", { name: "How much to add" }),
        ).toHaveValue(250);
        expect(screen.getByText("g")).toBeInTheDocument();
    });

    it("should describe the amount by its unit", () => {
        render(
            <FormField label="How much to add" htmlFor="quantity">
                <QuantityField
                    id="quantity"
                    unit="g"
                    value="250"
                    onChange={jest.fn()}
                />
            </FormField>,
        );

        expect(
            screen.getByRole("spinbutton", { name: "How much to add" }),
        ).toHaveAttribute("aria-describedby", "quantity-unit");
        expect(screen.getByText("g")).toHaveAttribute("id", "quantity-unit");
    });
});
