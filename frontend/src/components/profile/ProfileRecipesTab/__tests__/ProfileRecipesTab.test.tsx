import { screen } from "@testing-library/react";

import { ProfileRecipesTab } from "components/profile/ProfileRecipesTab";

import { renderWithRouter } from "test/router";

describe("ProfileRecipesTab", () => {
    it("should show an empty state when there are no recipes", () => {
        renderWithRouter(
            <ProfileRecipesTab
                recipes={[]}
                total={0}
                hasNextPage={false}
                isFetchingNextPage={false}
                fetchNextPage={jest.fn()}
            />,
        );

        expect(
            screen.getByText("You haven't created any recipes yet."),
        ).toBeInTheDocument();
    });
});
