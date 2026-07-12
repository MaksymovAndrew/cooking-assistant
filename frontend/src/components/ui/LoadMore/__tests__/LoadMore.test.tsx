import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LoadMore } from "components/ui/LoadMore";

const baseProps = {
    hasMore: true,
    isLoading: false,
    onLoadMore: jest.fn(),
    loadMoreLabel: "Load more",
    loadingLabel: "Loading more",
};

describe("LoadMore", () => {
    it("should render the counter line when countLabel is provided", () => {
        render(<LoadMore {...baseProps} countLabel="Showing 30 of 90" />);

        expect(screen.getByText("Showing 30 of 90")).toBeInTheDocument();
    });

    it("should not render a counter line when countLabel is omitted", () => {
        render(<LoadMore {...baseProps} />);

        expect(screen.queryByText(/showing/i)).not.toBeInTheDocument();
    });

    it("should call onLoadMore when the button is clicked", async () => {
        const onLoadMore = jest.fn();

        render(<LoadMore {...baseProps} onLoadMore={onLoadMore} />);

        await userEvent.click(
            screen.getByRole("button", { name: "Load more" }),
        );

        expect(onLoadMore).toHaveBeenCalledTimes(1);
    });

    it("should not render the button when hasMore is false", () => {
        render(<LoadMore {...baseProps} hasMore={false} />);

        expect(
            screen.queryByRole("button", { name: "Load more" }),
        ).not.toBeInTheDocument();
    });

    it("should disable the button and show a spinner while loading", () => {
        render(<LoadMore {...baseProps} isLoading />);

        expect(screen.getByRole("button")).toBeDisabled();
        expect(screen.getByRole("status")).toHaveAttribute(
            "aria-label",
            "Loading more",
        );
    });

    it("should not render a spinner when not loading", () => {
        render(<LoadMore {...baseProps} />);

        expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("should render the error message and keep the button for a manual retry", () => {
        render(<LoadMore {...baseProps} errorMessage="Couldn't load more" />);

        expect(screen.getByText("Couldn't load more")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Load more" }),
        ).toBeInTheDocument();
    });

    it("should not render an error line when errorMessage is omitted", () => {
        render(<LoadMore {...baseProps} />);

        expect(
            screen.queryByText(/couldn't load more/i),
        ).not.toBeInTheDocument();
    });
});
