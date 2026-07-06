import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Textarea } from "components/ui/Textarea";

describe("Textarea", () => {
    it("should call onChange when the user types", async () => {
        const onChange = jest.fn();

        render(
            <Textarea aria-label="Description" value="" onChange={onChange} />,
        );

        await userEvent.type(screen.getByLabelText("Description"), "a");

        expect(onChange).toHaveBeenCalled();
    });

    it("should apply the error class when hasError is set", () => {
        render(
            <Textarea
                aria-label="Description"
                hasError
                value=""
                onChange={jest.fn()}
            />,
        );

        expect(screen.getByLabelText("Description")).toHaveClass(
            "textarea--error",
        );
    });
});
