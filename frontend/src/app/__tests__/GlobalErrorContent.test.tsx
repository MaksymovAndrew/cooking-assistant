import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { GlobalErrorContent } from "app/GlobalErrorContent";

describe("GlobalErrorContent", () => {
    it("should explain the failure in the page's language", () => {
        render(<GlobalErrorContent locale="pl" onRetry={jest.fn()} />);

        expect(
            screen.getByRole("heading", { name: "Coś poszło nie tak" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Spróbuj ponownie" }),
        ).toBeInTheDocument();
    });

    it("should retry when asked to", async () => {
        const onRetry = jest.fn();

        render(<GlobalErrorContent locale="en" onRetry={onRetry} />);

        await userEvent.click(
            screen.getByRole("button", { name: "Try again" }),
        );

        expect(onRetry).toHaveBeenCalledTimes(1);
    });
});
