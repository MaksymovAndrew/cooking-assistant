import { screen } from "@testing-library/react";

import type { Menu } from "types/menu";

import { ProfileMenusTab } from "components/profile/ProfileMenusTab";

import { renderWithRouter } from "test/router";

const MENU: Menu = {
    id: 1,
    title: "Weekday menu",
    categoryname: "Lunch",
    menucontent: "",
    recipe_count: 3,
};

describe("ProfileMenusTab", () => {
    it("should render a card per menu", () => {
        renderWithRouter(
            <ProfileMenusTab
                menus={[MENU]}
                total={1}
                hasNextPage={false}
                isFetchingNextPage={false}
                fetchNextPage={jest.fn()}
            />,
        );

        expect(screen.getByText("Weekday menu")).toBeInTheDocument();
    });

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
