import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ErrorState } from "components/ui/ErrorState";

describe("ErrorState", () => {
    it("should render the title", () => {
        render(
            <ErrorState
                title="Couldn't load recipes"
                onRetry={jest.fn()}
                retryLabel="Try again"
            />,
        );

        expect(screen.getByText("Couldn't load recipes")).toBeInTheDocument();
    });

    it("should render the description when given", () => {
        render(
            <ErrorState
                title="Couldn't load recipes"
                description="Check your connection and try again."
                onRetry={jest.fn()}
                retryLabel="Try again"
            />,
        );

        expect(
            screen.getByText("Check your connection and try again."),
        ).toBeInTheDocument();
    });

    it("should call onRetry when the retry button is clicked", async () => {
        const onRetry = jest.fn();

        render(
            <ErrorState
                title="Couldn't load recipes"
                onRetry={onRetry}
                retryLabel="Try again"
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Try again" }),
        );

        expect(onRetry).toHaveBeenCalledTimes(1);
    });
});
