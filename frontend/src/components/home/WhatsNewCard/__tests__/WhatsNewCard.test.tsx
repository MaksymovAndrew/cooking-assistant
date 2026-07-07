import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { NEWS_ITEMS } from "constants/news";

import { WhatsNewCard } from "components/home/WhatsNewCard";

import { renderWithRouter } from "test/router";

describe("WhatsNewCard", () => {
    it("should render the title and the most recent news items", () => {
        renderWithRouter(<WhatsNewCard onOpenAll={jest.fn()} />);

        expect(screen.getByText("What's new")).toBeInTheDocument();
        expect(screen.getByText("A brand-new look")).toBeInTheDocument();
        expect(screen.getByText("Pantry-aware recipes")).toBeInTheDocument();
        expect(screen.getByText("Richer statistics")).toBeInTheDocument();
    });

    it("should show the new-items count badge", () => {
        renderWithRouter(<WhatsNewCard onOpenAll={jest.fn()} />);

        const newCount = NEWS_ITEMS.filter((entry) => entry.isNew).length;

        expect(screen.getByText(`${newCount} new`)).toBeInTheDocument();
    });

    it("should call onOpenAll when clicked", async () => {
        const onOpenAll = jest.fn();

        renderWithRouter(<WhatsNewCard onOpenAll={onOpenAll} />);

        await userEvent.click(screen.getByText("What's new"));

        expect(onOpenAll).toHaveBeenCalledTimes(1);
    });
});
