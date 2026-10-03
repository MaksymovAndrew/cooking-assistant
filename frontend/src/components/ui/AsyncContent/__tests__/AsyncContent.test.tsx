import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AsyncContent } from "components/ui/AsyncContent";

const renderContent = (
    isLoading: boolean,
    isError: boolean,
    onRetry = jest.fn(),
) =>
    render(
        <AsyncContent isLoading={isLoading} isError={isError} onRetry={onRetry}>
            <p>Loaded</p>
        </AsyncContent>,
    );

describe("AsyncContent", () => {
    it("should show a skeleton instead of the content while loading", () => {
        renderContent(true, false);

        expect(screen.getByRole("status", { name: "Loading…" })).toBeVisible();
        expect(screen.queryByText("Loaded")).not.toBeInTheDocument();
    });

    it("should show an error with a retry instead of the content when the request failed", async () => {
        const onRetry = jest.fn();

        renderContent(false, true, onRetry);
        await userEvent.click(
            screen.getByRole("button", { name: "Try again" }),
        );

        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
        expect(screen.queryByText("Loaded")).not.toBeInTheDocument();
        expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("should show the content once it has loaded", () => {
        renderContent(false, false);

        expect(screen.getByText("Loaded")).toBeInTheDocument();
    });
});
