import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TextInput } from "components/ui/TextInput";

describe("TextInput", () => {
    it("should call onChange when the user types", async () => {
        const onChange = jest.fn();

        render(<TextInput aria-label="Title" value="" onChange={onChange} />);

        await userEvent.type(screen.getByLabelText("Title"), "a");

        expect(onChange).toHaveBeenCalled();
    });

    it("should apply the error class when hasError is set", () => {
        render(
            <TextInput
                aria-label="Title"
                hasError
                value=""
                onChange={jest.fn()}
            />,
        );

        expect(screen.getByLabelText("Title")).toHaveClass("text-input--error");
    });
});
