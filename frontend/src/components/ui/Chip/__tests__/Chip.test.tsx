import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Chip } from "components/ui/Chip";

describe("Chip", () => {
    it("should render its label", () => {
        render(<Chip>Main course</Chip>);

        expect(screen.getByText("Main course")).toBeInTheDocument();
    });

    it("should default to the type variant", () => {
        render(<Chip>Main course</Chip>);

        expect(screen.getByText("Main course")).toHaveClass("chip--type");
    });

    it("should apply the requested variant class", () => {
        render(<Chip variant="warning">Expiring soon</Chip>);

        expect(screen.getByText("Expiring soon")).toHaveClass("chip--warning");
    });

    it("should render a leading icon when given", () => {
        render(<Chip icon={<span data-testid="icon" />}>Fresh</Chip>);

        expect(screen.getByTestId("icon")).toBeInTheDocument();
    });

    it("should not render a remove button by default", () => {
        render(<Chip>Main course</Chip>);

        expect(
            screen.queryByRole("button", { name: "Remove" }),
        ).not.toBeInTheDocument();
    });

    it("should call onRemove when the remove button is clicked", async () => {
        const onRemove = jest.fn();

        render(
            <Chip removable onRemove={onRemove}>
                Max time: 90 min
            </Chip>,
        );

        await userEvent.click(screen.getByRole("button", { name: "Remove" }));

        expect(onRemove).toHaveBeenCalledTimes(1);
    });
});
