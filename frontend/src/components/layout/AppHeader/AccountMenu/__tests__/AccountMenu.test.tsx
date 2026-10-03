import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AccountMenu } from "components/layout/AppHeader/AccountMenu";

import { renderWithRouter } from "test/router";

const TRIGGER_NAME = "Account menu";

const renderMenu = (onLogout = jest.fn()) =>
    renderWithRouter(
        <AccountMenu
            name="Claude"
            surname="Cook"
            login="claude"
            onLogout={onLogout}
        />,
    );

const openMenu = async () => {
    await userEvent.click(screen.getByRole("button", { name: TRIGGER_NAME }));
};

describe("AccountMenu", () => {
    it("should not show the menu panel by default", () => {
        renderMenu();

        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("should open the menu panel when the trigger is clicked", async () => {
        renderMenu();

        await openMenu();

        expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    it("should show the user's name and login in the menu header", async () => {
        renderMenu();

        await openMenu();

        expect(screen.getByText("Claude Cook")).toBeInTheDocument();
        expect(screen.getByText("@claude")).toBeInTheDocument();
    });

    it("should link Profile and Settings to their routes", async () => {
        renderMenu();

        await openMenu();

        expect(
            screen.getByRole("menuitem", { name: /Profile/ }),
        ).toHaveAttribute("href", "/profile");
        expect(
            screen.getByRole("menuitem", { name: /Settings/ }),
        ).toHaveAttribute("href", "/settings");
    });

    it("should offer the language and the theme inside the menu for phones", async () => {
        renderMenu();

        await openMenu();

        expect(screen.getByText("Language")).toBeInTheDocument();
        expect(screen.getByText("Theme")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Toggle theme" }),
        ).toBeInTheDocument();
    });

    it("should call onLogout when the Logout item is clicked", async () => {
        const onLogout = jest.fn();

        renderMenu(onLogout);

        await openMenu();
        await userEvent.click(
            screen.getByRole("menuitem", { name: "Log out" }),
        );

        expect(onLogout).toHaveBeenCalledTimes(1);
    });

    it("should close the menu when Escape is pressed", async () => {
        renderMenu();

        await openMenu();
        await userEvent.keyboard("{Escape}");

        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("should close the menu when clicking outside of it", async () => {
        renderWithRouter(
            <div>
                <AccountMenu
                    name="Claude"
                    surname="Cook"
                    login="claude"
                    onLogout={jest.fn()}
                />
                <button type="button">Outside</button>
            </div>,
        );

        await openMenu();
        await userEvent.click(screen.getByRole("button", { name: "Outside" }));

        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("should land on the first item when the menu opens", async () => {
        renderMenu();

        await openMenu();

        expect(screen.getByRole("menuitem", { name: /Profile/ })).toHaveFocus();
    });

    it("should move between the items with the arrow keys and wrap at the ends", async () => {
        renderMenu();

        await openMenu();
        await userEvent.keyboard("{ArrowDown}");

        expect(
            screen.getByRole("menuitem", { name: /Settings/ }),
        ).toHaveFocus();

        await userEvent.keyboard("{Home}{ArrowUp}");

        expect(screen.getByRole("menuitem", { name: "Log out" })).toHaveFocus();
    });

    it("should leave the language menu's own keys to it", async () => {
        renderMenu();

        await openMenu();
        await userEvent.keyboard("{End}{ArrowUp}{ArrowUp}{Enter}");
        await userEvent.keyboard("{ArrowDown}");

        expect(
            screen.getByRole("menuitemradio", { name: "Polski" }),
        ).toHaveFocus();
    });

    it("should return focus to the trigger when Escape closes the menu", async () => {
        renderMenu();

        await openMenu();
        await userEvent.keyboard("{Escape}");

        expect(
            screen.getByRole("button", { name: TRIGGER_NAME }),
        ).toHaveFocus();
    });
});
