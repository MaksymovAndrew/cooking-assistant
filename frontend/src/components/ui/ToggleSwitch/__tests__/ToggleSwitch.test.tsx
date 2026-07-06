import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ToggleSwitch } from "components/ui/ToggleSwitch";

const LABEL = "Expiry alerts";

describe("ToggleSwitch", () => {
    it("should reflect the checked state via aria-checked", () => {
        render(<ToggleSwitch checked label={LABEL} onChange={jest.fn()} />);

        expect(screen.getByRole("switch", { name: LABEL })).toHaveAttribute(
            "aria-checked",
            "true",
        );
    });

    it("should call onChange with the opposite value when clicked", async () => {
        const onChange = jest.fn();

        render(
            <ToggleSwitch checked={false} label={LABEL} onChange={onChange} />,
        );

        await userEvent.click(screen.getByRole("switch", { name: LABEL }));

        expect(onChange).toHaveBeenCalledWith(true);
    });

    it("should be disabled when requested", () => {
        render(
            <ToggleSwitch
                checked={false}
                label={LABEL}
                onChange={jest.fn()}
                disabled
            />,
        );

        expect(screen.getByRole("switch", { name: LABEL })).toBeDisabled();
    });
});
