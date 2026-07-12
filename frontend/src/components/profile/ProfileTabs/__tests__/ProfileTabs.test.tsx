import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PROFILE_TAB } from "hooks/useProfilePage";

import { ProfileTabs } from "components/profile/ProfileTabs";

import { renderWithRouter } from "test/router";

describe("ProfileTabs", () => {
    it("should mark the active tab as selected", () => {
        renderWithRouter(
            <ProfileTabs
                activeTab={PROFILE_TAB.recipes}
                onChange={jest.fn()}
                onLogout={jest.fn()}
            />,
        );

        expect(screen.getByRole("tab", { name: "My recipes" })).toHaveAttribute(
            "aria-selected",
            "true",
        );
        expect(screen.getByRole("tab", { name: "My menus" })).toHaveAttribute(
            "aria-selected",
            "false",
        );
    });

    it("should call onChange when a tab is clicked", async () => {
        const onChange = jest.fn();

        renderWithRouter(
            <ProfileTabs
                activeTab={PROFILE_TAB.recipes}
                onChange={onChange}
                onLogout={jest.fn()}
            />,
        );

        await userEvent.click(screen.getByRole("tab", { name: "My menus" }));

        expect(onChange).toHaveBeenCalledWith(PROFILE_TAB.menus);
    });

    it("should call onLogout when the logout button is clicked", async () => {
        const onLogout = jest.fn();

        renderWithRouter(
            <ProfileTabs
                activeTab={PROFILE_TAB.recipes}
                onChange={jest.fn()}
                onLogout={onLogout}
            />,
        );

        await userEvent.click(screen.getByRole("button", { name: "Logout" }));

        expect(onLogout).toHaveBeenCalledTimes(1);
    });

    it("should render Settings as a link to the settings page", () => {
        renderWithRouter(
            <ProfileTabs
                activeTab={PROFILE_TAB.recipes}
                onChange={jest.fn()}
                onLogout={jest.fn()}
            />,
        );

        expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute(
            "href",
            "/settings",
        );
    });
});
