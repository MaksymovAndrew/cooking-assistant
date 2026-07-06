import { render, screen } from "@testing-library/react";

import { FormField } from "components/ui/FormField";

describe("FormField", () => {
    it("should associate the label with the field via htmlFor", () => {
        render(
            <FormField label="Title" htmlFor="recipe-title">
                <input id="recipe-title" />
            </FormField>,
        );

        expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });

    it("should not render an error message by default", () => {
        render(
            <FormField label="Title" htmlFor="recipe-title">
                <input id="recipe-title" />
            </FormField>,
        );

        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("should render the error message when provided", () => {
        render(
            <FormField
                label="Title"
                htmlFor="recipe-title"
                error="Title is required"
            >
                <input id="recipe-title" />
            </FormField>,
        );

        expect(screen.getByRole("alert")).toHaveTextContent(
            "Title is required",
        );
    });
});
