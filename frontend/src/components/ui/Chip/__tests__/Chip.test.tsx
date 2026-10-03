import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Chip } from "components/ui/Chip";

describe("Chip", () => {
    it("should not render a remove button by default", () => {
        render(<Chip>Main course</Chip>);

        expect(
            screen.queryByRole("button", { name: /Remove/ }),
        ).not.toBeInTheDocument();
    });

    it("should call onRemove when the remove button is clicked", async () => {
        const onRemove = jest.fn();

        render(
            <Chip removable onRemove={onRemove} name="Max time: 90 min">
                Max time: 90 min
            </Chip>,
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Remove Max time: 90 min" }),
        );

        expect(onRemove).toHaveBeenCalledTimes(1);
    });
});
