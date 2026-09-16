import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Heart } from "lucide-react";

import { FilterToggle } from "components/ui/FilterToggle";

const LABEL = "Only my favourites";

describe("FilterToggle", () => {
    it("should render the label next to a switch reflecting the checked state", () => {
        render(
            <FilterToggle
                icon={Heart}
                label={LABEL}
                checked
                onChange={jest.fn()}
            />,
        );

        expect(screen.getByText(LABEL)).toBeInTheDocument();
        expect(screen.getByRole("switch", { name: LABEL })).toBeChecked();
    });

    it("should report the new value when the switch is flipped", async () => {
        const onChange = jest.fn();

        render(
            <FilterToggle
                icon={Heart}
                label={LABEL}
                checked={false}
                onChange={onChange}
            />,
        );

        await userEvent.click(screen.getByRole("switch", { name: LABEL }));

        expect(onChange).toHaveBeenCalledWith(true);
    });
});
