import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AppShell } from "components/layout/AppShell";

import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

const renderShell = () =>
    renderWithProviders(
        <AppShell>
            <p>Page content</p>
        </AppShell>,
        { store: makeTestStore({ session: { status: "guest" } }) },
    );

describe("AppShell", () => {
    it("should offer the skip link before anything else", async () => {
        renderShell();

        await userEvent.tab();

        expect(
            screen.getByRole("link", { name: "Skip to content" }),
        ).toHaveFocus();
    });

    it("should skip straight to the page content", async () => {
        renderShell();

        await userEvent.click(
            screen.getByRole("link", { name: "Skip to content" }),
        );

        expect(screen.getByRole("main")).toHaveFocus();
        expect(screen.getByRole("main")).toHaveTextContent("Page content");
    });

    it("should tell its two navigation landmarks apart", () => {
        renderShell();

        expect(
            screen.getByRole("navigation", { name: "Main" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("navigation", { name: "Tab bar" }),
        ).toBeInTheDocument();
    });
});
