import { screen } from "@testing-library/react";

import { ProfileMenusTab } from "components/profile/ProfileMenusTab";

import { renderWithRouter } from "test/router";

describe("ProfileMenusTab", () => {
    it("should show an empty state when there are no menus", () => {
        renderWithRouter(
            <ProfileMenusTab
                menus={[]}
                total={0}
                hasNextPage={false}
                isFetchingNextPage={false}
                fetchNextPage={jest.fn()}
            />,
        );

        expect(
            screen.getByText("You haven't created any menus yet."),
        ).toBeInTheDocument();
    });
});
