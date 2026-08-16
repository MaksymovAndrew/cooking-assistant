import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { selectActiveModal } from "redux/selectors/uiSelectors";
import type { ActiveModal } from "redux/slices/uiSlice";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { NewsModal } from "components/modals/NewsModal";

import type { NewsEntry } from "utils/newsItems";
import { getNewsItems } from "utils/newsItems";

import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("utils/newsItems");

const MODAL_ID = "m1";
const MODAL: ActiveModal = { id: MODAL_ID, type: MODAL_TYPE.news };

const NEWS_ITEMS: NewsEntry[] = [
    {
        id: "second",
        date: "2026-08-06",
        title: "Browse without an account",
        description: "Look through every recipe and menu before signing up.",
    },
    {
        id: "first",
        date: "2026-08-16",
        title: "Smarter pantry, calmer popups",
        description: "Buying more of an ingredient keeps its own expiry date.",
    },
];

const renderOpen = () => {
    const store = makeTestStore({ ui: { queue: [MODAL] } });

    return renderWithProviders(<NewsModal modalId={MODAL_ID} />, { store });
};

describe("NewsModal", () => {
    beforeEach(() => {
        jest.mocked(getNewsItems).mockReturnValue(NEWS_ITEMS);
    });

    it("should render the title and the news items", () => {
        renderOpen();

        expect(screen.getByText("What's new")).toBeInTheDocument();
        expect(
            screen.getByText("Browse without an account"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("Smarter pantry, calmer popups"),
        ).toBeInTheDocument();
    });

    it("should only render the 10 most recent items", () => {
        const manyItems: NewsEntry[] = Array.from({ length: 12 }, (_, i) => ({
            id: `item-${i}`,
            date: `2026-08-${String(i + 1).padStart(2, "0")}`,
            title: `Update ${i}`,
            description: "Description",
        }));

        jest.mocked(getNewsItems).mockReturnValue(manyItems);
        renderOpen();

        expect(screen.getByText("Update 0")).toBeInTheDocument();
        expect(screen.getByText("Update 9")).toBeInTheDocument();
        expect(screen.queryByText("Update 10")).not.toBeInTheDocument();
    });

    it("should close the modal on the close button", async () => {
        const { store } = renderOpen();

        await userEvent.click(screen.getByRole("button", { name: "Close" }));

        expect(selectActiveModal(store.getState())).toBeNull();
    });

    it("should close the modal when the overlay is clicked", async () => {
        const { store } = renderOpen();

        await userEvent.click(screen.getByRole("presentation"));

        expect(selectActiveModal(store.getState())).toBeNull();
    });

    it("should not close the modal when clicking inside the dialog", async () => {
        const { store } = renderOpen();

        await userEvent.click(screen.getByText("What's new"));

        expect(selectActiveModal(store.getState())).toEqual(MODAL);
    });

    it("should close the modal when Escape is pressed", async () => {
        const { store } = renderOpen();

        await userEvent.keyboard("{Escape}");

        expect(selectActiveModal(store.getState())).toBeNull();
    });
});
