import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { WhatsNewCard } from "components/home/WhatsNewCard";

import { getNewsItems } from "utils/newsItems";

import { renderWithRouter } from "test/router";

const OLDEST_DATE = "2000-01-01";

describe("WhatsNewCard", () => {
    it("should render the title and the most recent news items", () => {
        const items = getNewsItems();

        renderWithRouter(
            <WhatsNewCard
                onOpenAll={jest.fn()}
                unseenCount={0}
                lastSeenDate={items[0].date}
            />,
        );

        expect(screen.getByText("What's new")).toBeInTheDocument();
        items.slice(0, 3).forEach((item) => {
            expect(screen.getByText(item.title)).toBeInTheDocument();
        });
    });

    it("should show the unseen-count badge", () => {
        renderWithRouter(
            <WhatsNewCard
                onOpenAll={jest.fn()}
                unseenCount={3}
                lastSeenDate={OLDEST_DATE}
            />,
        );

        expect(screen.getByText("3 new")).toBeInTheDocument();
    });

    it("should hide the badge once everything has been seen", () => {
        renderWithRouter(
            <WhatsNewCard
                onOpenAll={jest.fn()}
                unseenCount={0}
                lastSeenDate={getNewsItems()[0].date}
            />,
        );

        expect(screen.queryByText(/^\d+ new$/)).not.toBeInTheDocument();
    });

    it("should call onOpenAll when clicked", async () => {
        const onOpenAll = jest.fn();

        renderWithRouter(
            <WhatsNewCard
                onOpenAll={onOpenAll}
                unseenCount={0}
                lastSeenDate={getNewsItems()[0].date}
            />,
        );

        await userEvent.click(screen.getByText("What's new"));

        expect(onOpenAll).toHaveBeenCalledTimes(1);
    });
});
