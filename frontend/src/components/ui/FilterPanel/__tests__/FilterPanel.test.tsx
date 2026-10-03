import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FilterPanel } from "components/ui/FilterPanel";

const TRIGGER_NAME = /Filters/;
const CLOSE_LABEL = "Close filters";
const APPLY_LABEL = "Show 5 recipes";

const setup = () => {
    render(
        <FilterPanel
            title="Filters"
            closeLabel={CLOSE_LABEL}
            resetLabel="Reset filters"
            applyAriaLabel={APPLY_LABEL}
            applyMobileLabel={APPLY_LABEL}
            applyDesktopLabel="Apply"
            activeCount={0}
            onReset={jest.fn()}
        >
            <button type="button">Only my favourites</button>
        </FilterPanel>,
    );
};

const openPanel = async () => {
    await userEvent.click(screen.getByRole("button", { name: TRIGGER_NAME }));
};

describe("FilterPanel", () => {
    it("should move focus to the first control when the filters open", async () => {
        setup();

        await openPanel();

        expect(screen.getByRole("button", { name: CLOSE_LABEL })).toHaveFocus();
    });

    it("should return focus to the trigger when Escape closes the filters", async () => {
        setup();

        await openPanel();
        await userEvent.keyboard("{Escape}");

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: TRIGGER_NAME }),
        ).toHaveFocus();
    });

    it("should return focus to the trigger when the close button closes the filters", async () => {
        setup();

        await openPanel();
        await userEvent.keyboard("{Enter}");

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: TRIGGER_NAME }),
        ).toHaveFocus();
    });

    it("should return focus to the trigger when Apply closes the filters", async () => {
        setup();

        await openPanel();
        await userEvent.click(
            screen.getByRole("button", { name: APPLY_LABEL }),
        );

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: TRIGGER_NAME }),
        ).toHaveFocus();
    });

    it("should close the filters when the backdrop behind them is clicked", async () => {
        setup();

        await openPanel();
        await userEvent.click(screen.getByRole("presentation"));

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
});
