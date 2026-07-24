import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AvatarPicker } from "components/profile/AvatarPicker";

describe("AvatarPicker", () => {
    it("should mark the current value as checked", () => {
        render(<AvatarPicker value="tomato" onChange={jest.fn()} />);

        expect(screen.getByRole("radio", { name: "tomato" })).toHaveAttribute(
            "aria-checked",
            "true",
        );
        expect(
            screen.getByRole("radio", { name: "No avatar" }),
        ).toHaveAttribute("aria-checked", "false");
    });

    it("should call onChange with the selected avatar key", async () => {
        const onChange = jest.fn();

        render(<AvatarPicker value={null} onChange={onChange} />);

        await userEvent.click(screen.getByRole("radio", { name: "sushi" }));

        expect(onChange).toHaveBeenCalledWith("sushi");
    });

    it("should call onChange with null when the no-avatar option is selected", async () => {
        const onChange = jest.fn();

        render(<AvatarPicker value="tomato" onChange={onChange} />);

        await userEvent.click(screen.getByRole("radio", { name: "No avatar" }));

        expect(onChange).toHaveBeenCalledWith(null);
    });
});
