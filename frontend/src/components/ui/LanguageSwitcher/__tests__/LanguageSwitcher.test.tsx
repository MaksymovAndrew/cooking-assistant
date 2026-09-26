import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LanguageSwitcher } from "components/ui/LanguageSwitcher";

import { loadPage } from "utils/reloadPage";

import { renderWithRouter } from "test/router";

jest.mock("utils/reloadPage");

const TRIGGER_NAME = "Language: English";

const openMenu = async () => {
    renderWithRouter(<LanguageSwitcher />, ["/all-recipes"]);
    await userEvent.click(screen.getByRole("button", { name: TRIGGER_NAME }));
};

describe("LanguageSwitcher", () => {
    afterEach(() => {
        document.cookie = "NEXT_LOCALE=; Path=/; Max-Age=0";
    });

    it("should show the current language's code", () => {
        renderWithRouter(<LanguageSwitcher />);

        expect(screen.getByText("EN")).toBeInTheDocument();
    });

    it("should list every language by its own name, the current one checked", async () => {
        await openMenu();

        expect(
            screen.getByRole("menuitemradio", { name: "English" }),
        ).toHaveAttribute("aria-checked", "true");
        expect(
            screen.getByRole("menuitemradio", { name: "Українська" }),
        ).toHaveAttribute("aria-checked", "false");
    });

    it("should focus the current language when opened", async () => {
        await openMenu();

        expect(
            screen.getByRole("menuitemradio", { name: "English" }),
        ).toHaveFocus();
    });

    it("should move focus with the arrow keys", async () => {
        await openMenu();

        fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowUp" });

        expect(
            screen.getByRole("menuitemradio", { name: "Українська" }),
        ).toHaveFocus();
    });

    it("should load the same page in the chosen language", async () => {
        await openMenu();

        await userEvent.click(
            screen.getByRole("menuitemradio", { name: "Polski" }),
        );

        expect(jest.mocked(loadPage)).toHaveBeenCalledWith("/pl/all-recipes");
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    it("should close on Escape", async () => {
        await openMenu();

        await userEvent.keyboard("{Escape}");

        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
});
