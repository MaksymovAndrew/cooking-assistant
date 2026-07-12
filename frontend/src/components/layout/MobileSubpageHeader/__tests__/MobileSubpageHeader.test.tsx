import { screen } from "@testing-library/react";

import { MobileSubpageHeader } from "components/layout/MobileSubpageHeader";

import { renderWithRouter } from "test/router";

describe("MobileSubpageHeader", () => {
    it("should link the back button to the given target", () => {
        renderWithRouter(<MobileSubpageHeader backTo="/all-recipes" />);

        expect(screen.getByRole("link", { name: "Back" })).toHaveAttribute(
            "href",
            "/all-recipes",
        );
    });

    it("should show the app wordmark linking home", () => {
        renderWithRouter(<MobileSubpageHeader backTo="/all-recipes" />);

        expect(
            screen.getByRole("link", { name: "Cooking Assistant" }),
        ).toHaveAttribute("href", "/");
    });

    it("should show the page title instead of the wordmark when title is given", () => {
        renderWithRouter(
            <MobileSubpageHeader backTo="/all-menus" title="Sunday dinners" />,
        );

        expect(screen.getByText("Sunday dinners")).toBeInTheDocument();
        expect(
            screen.queryByRole("link", { name: "Cooking Assistant" }),
        ).not.toBeInTheDocument();
    });

    it("should show an edit link on the right when editTo is given", () => {
        renderWithRouter(
            <MobileSubpageHeader
                backTo="/all-menus"
                title="Sunday dinners"
                editTo="/change-menu/1"
            />,
        );

        expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute(
            "href",
            "/change-menu/1",
        );
    });
});
