import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import { AccountMenu } from "components/layout/AppHeader/AccountMenu";

const TRIGGER_NAME = "Account menu";

const renderMenu = (onLogout = jest.fn()) =>
    render(
        <MemoryRouter>
            <AccountMenu
                name="Claude"
                surname="Cook"
                login="claude"
                onLogout={onLogout}
            />
        </MemoryRouter>,
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

    it("should give the Logout item the same full-width item class as Profile and Settings", async () => {
        renderMenu();

        await openMenu();

        const itemClass = screen.getByRole("menuitem", {
            name: /Profile/,
        }).className;

        expect(
            screen.getByRole("menuitem", { name: "Logout" }).className,
        ).toContain(itemClass);
    });

    it("should call onLogout when the Logout item is clicked", async () => {
        const onLogout = jest.fn();

        renderMenu(onLogout);

        await openMenu();
        await userEvent.click(screen.getByRole("menuitem", { name: "Logout" }));

        expect(onLogout).toHaveBeenCalledTimes(1);
    });

    it("should close the menu when Escape is pressed", async () => {
        renderMenu();

        await openMenu();
        await userEvent.keyboard("{Escape}");

        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("should close the menu when clicking outside of it", async () => {
        render(
            <MemoryRouter>
                <div>
                    <AccountMenu
                        name="Claude"
                        surname="Cook"
                        login="claude"
                        onLogout={jest.fn()}
                    />
                    <button type="button">Outside</button>
                </div>
            </MemoryRouter>,
        );

        await openMenu();
        await userEvent.click(screen.getByRole("button", { name: "Outside" }));

        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
});
