import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Tag } from "types/tag";

import { API_ROUTES } from "api/endpoints";

import { RecipeTagsFilter } from "components/recipes/RecipeFilterPanel/RecipeFilterPopover/RecipeTagsFilter";

import { mockGetByUrl } from "test/apiClientMock";
import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const QUICK: Tag = { id: 1, name: "Quick" };
const SLOW: Tag = { id: 2, name: "Slow" };

const renderFilter = (
    value: number[],
    handleChange = jest.fn(),
    tags = [QUICK, SLOW],
) => {
    mockGetByUrl({ [API_ROUTES.tags.list]: tags });

    renderWithProviders(
        <RecipeTagsFilter value={value} onChange={handleChange} />,
        {
            store: makeTestStore({ session: { status: "authed" } }),
        },
    );
};

describe("RecipeTagsFilter", () => {
    it("should offer the viewer's tags as chips", async () => {
        renderFilter([QUICK.id]);

        expect(
            await screen.findByRole("checkbox", { name: QUICK.name }),
        ).toHaveAttribute("aria-checked", "true");
        expect(
            screen.getByRole("checkbox", { name: SLOW.name }),
        ).toHaveAttribute("aria-checked", "false");
    });

    it("should add a tag to the filter when its chip is pressed", async () => {
        const handleChange = jest.fn();

        renderFilter([], handleChange);
        const user = userEvent.setup();

        await user.click(
            await screen.findByRole("checkbox", { name: SLOW.name }),
        );

        expect(handleChange).toHaveBeenCalledWith([SLOW.id]);
    });

    it("should render nothing for a viewer with no tags", () => {
        renderFilter([], jest.fn(), []);

        expect(screen.queryByText("My tags")).not.toBeInTheDocument();
    });
});
