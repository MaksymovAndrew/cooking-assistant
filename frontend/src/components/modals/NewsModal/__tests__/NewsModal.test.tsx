import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { NewsModal } from "components/modals/NewsModal";

describe("NewsModal", () => {
    it("should render nothing when closed", () => {
        const { container } = render(
            <NewsModal isOpen={false} onClose={jest.fn()} />,
        );

        expect(container).toBeEmptyDOMElement();
    });

    it("should render the title and the news items when open", () => {
        render(<NewsModal isOpen onClose={jest.fn()} />);

        expect(screen.getByText("What's new")).toBeInTheDocument();
        expect(
            screen.getByText("Calorie tracking is here"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("Smarter search and shareable filters"),
        ).toBeInTheDocument();
        expect(screen.getByText("A brand-new look")).toBeInTheDocument();
    });

    it("should call onClose when the close button is clicked", async () => {
        const onClose = jest.fn();

        render(<NewsModal isOpen onClose={onClose} />);

        await userEvent.click(screen.getByRole("button", { name: "Close" }));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should call onClose when the overlay is clicked", async () => {
        const onClose = jest.fn();

        render(<NewsModal isOpen onClose={onClose} />);

        await userEvent.click(screen.getByRole("presentation"));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should not call onClose when clicking inside the dialog", async () => {
        const onClose = jest.fn();

        render(<NewsModal isOpen onClose={onClose} />);

        await userEvent.click(screen.getByText("What's new"));

        expect(onClose).not.toHaveBeenCalled();
    });

    it("should call onClose when Escape is pressed", async () => {
        const onClose = jest.fn();

        render(<NewsModal isOpen onClose={onClose} />);

        await userEvent.keyboard("{Escape}");

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
