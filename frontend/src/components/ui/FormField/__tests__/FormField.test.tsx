import { render, screen } from "@testing-library/react";

import { FormField } from "components/ui/FormField";
import { TextInput } from "components/ui/TextInput";

const DESCRIBED_BY = "aria-describedby";

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
                <TextInput id="recipe-title" />
            </FormField>,
        );

        expect(screen.getByLabelText("Title")).not.toHaveAttribute(
            "aria-invalid",
        );
        expect(screen.getByLabelText("Title")).not.toHaveAttribute(
            DESCRIBED_BY,
        );
    });

    it("should describe the field by its error and mark it invalid", () => {
        render(
            <FormField
                label="Title"
                htmlFor="recipe-title"
                error="Title is required"
            >
                <TextInput id="recipe-title" />
            </FormField>,
        );

        const field = screen.getByLabelText("Title");

        expect(field).toHaveAttribute(DESCRIBED_BY, "recipe-title-error");
        expect(field).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByText("Title is required")).toHaveAttribute(
            "id",
            "recipe-title-error",
        );
    });

    it("should not announce a field error as an alert", () => {
        render(
            <FormField
                label="Title"
                htmlFor="recipe-title"
                error="Title is required"
            >
                <TextInput id="recipe-title" />
            </FormField>,
        );

        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("should describe the field by its hint and its error together", () => {
        render(
            <FormField
                label="Title"
                htmlFor="recipe-title"
                hint="Up to 100 characters"
                error="Title is required"
            >
                <TextInput id="recipe-title" />
            </FormField>,
        );

        expect(screen.getByLabelText("Title")).toHaveAttribute(
            DESCRIBED_BY,
            "recipe-title-hint recipe-title-error",
        );
        expect(screen.getByText("Up to 100 characters")).toHaveAttribute(
            "id",
            "recipe-title-hint",
        );
    });

    it("should keep a description the field was given itself", () => {
        render(
            <>
                <p id="own-note">Shown on your profile</p>
                <FormField
                    label="Title"
                    htmlFor="recipe-title"
                    hint="Up to 100 characters"
                >
                    <TextInput id="recipe-title" aria-describedby="own-note" />
                </FormField>
            </>,
        );

        expect(screen.getByLabelText("Title")).toHaveAttribute(
            DESCRIBED_BY,
            "own-note recipe-title-hint",
        );
    });
});
