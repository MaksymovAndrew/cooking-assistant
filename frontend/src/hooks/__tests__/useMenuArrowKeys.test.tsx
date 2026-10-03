import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";

import { useMenuArrowKeys } from "hooks/useMenuArrowKeys";

// a disabled fieldset stands in for an item hidden at this width: it matches, but refuses focus
const Menu = ({ hideAll = false }) => {
    const ref = useRef<HTMLDivElement>(null);
    const handleKeyDown = useMenuArrowKeys(ref);

    return (
        <div ref={ref} role="menu" tabIndex={-1} onKeyDown={handleKeyDown}>
            <fieldset disabled={hideAll}>
                <button role="menuitem">Profile</button>
            </fieldset>
            <fieldset disabled>
                <button role="menuitem">Theme</button>
            </fieldset>
            <fieldset disabled={hideAll}>
                <button role="menuitem">Log out</button>
            </fieldset>
        </div>
    );
};

describe("useMenuArrowKeys", () => {
    it("should land on the first item when the menu opens", () => {
        render(<Menu />);

        expect(screen.getByRole("menuitem", { name: "Profile" })).toHaveFocus();
    });

    it("should skip an item that can't take focus", async () => {
        render(<Menu />);

        await userEvent.keyboard("{ArrowDown}");

        expect(screen.getByRole("menuitem", { name: "Log out" })).toHaveFocus();

        await userEvent.keyboard("{ArrowUp}");

        expect(screen.getByRole("menuitem", { name: "Profile" })).toHaveFocus();
    });

    it("should leave focus alone when no item can take it", async () => {
        render(<Menu hideAll />);

        screen.getByRole("menu").focus();
        await userEvent.keyboard("{ArrowDown}");

        expect(screen.getByRole("menu")).toHaveFocus();
    });
});
