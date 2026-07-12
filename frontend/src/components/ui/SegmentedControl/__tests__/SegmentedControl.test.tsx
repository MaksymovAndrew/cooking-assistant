import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SegmentedControl } from "components/ui/SegmentedControl";

const GROUP_LABEL = "Sort by time";
const FAST_LABEL = "Fast → long";
const SLOW_LABEL = "Long → fast";

const OPTIONS = [
    { value: "fast", label: FAST_LABEL },
    { value: "slow", label: SLOW_LABEL },
] as const;

describe("SegmentedControl", () => {
    it("should mark the selected option as checked", () => {
        render(
            <SegmentedControl
                options={OPTIONS}
                value="fast"
                onChange={jest.fn()}
                label={GROUP_LABEL}
            />,
        );

        expect(screen.getByRole("radio", { name: FAST_LABEL })).toHaveAttribute(
            "aria-checked",
            "true",
        );
        expect(screen.getByRole("radio", { name: SLOW_LABEL })).toHaveAttribute(
            "aria-checked",
            "false",
        );
    });

    it("should call onChange with the clicked option's value", async () => {
        const onChange = jest.fn();

        render(
            <SegmentedControl
                options={OPTIONS}
                value="fast"
                onChange={onChange}
                label={GROUP_LABEL}
            />,
        );

        await userEvent.click(screen.getByRole("radio", { name: SLOW_LABEL }));

        expect(onChange).toHaveBeenCalledWith("slow");
    });
});
