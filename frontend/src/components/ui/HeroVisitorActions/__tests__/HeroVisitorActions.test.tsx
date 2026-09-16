import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { HeroVisitorActions } from "components/ui/HeroVisitorActions";

import { renderWithRouter } from "test/router";

const FAVOURITE = {
    isFavourite: false,
    isDisabled: false,
    toggle: jest.fn().mockResolvedValue(undefined),
};

describe("HeroVisitorActions", () => {
    it("should show a login CTA linking to /login for an anonymous viewer", () => {
        renderWithRouter(
            <HeroVisitorActions
                favourite={null}
                favouriteLabel="Favourite"
                guestCtaLabel="Log in for the full experience"
                logIntakeLabel="Log intake"
            />,
        );

        expect(
            screen.getByRole("link", {
                name: "Log in for the full experience",
            }),
        ).toHaveAttribute("href", "/login");
        expect(
            screen.queryByRole("button", { name: "Favourite" }),
        ).not.toBeInTheDocument();
    });

    it("should show the favourite toggle for a signed-in non-owner", () => {
        renderWithRouter(
            <HeroVisitorActions
                favourite={FAVOURITE}
                favouriteLabel="Favourite"
                guestCtaLabel="Log in for the full experience"
                logIntakeLabel="Log intake"
            />,
        );

        expect(
            screen.getByRole("button", { name: "Favourite" }),
        ).toHaveAttribute("aria-pressed", "false");
        expect(
            screen.queryByRole("button", { name: "Log intake" }),
        ).not.toBeInTheDocument();
    });

    it("should call onLogIntake when the log-intake button is clicked", async () => {
        const onLogIntake = jest.fn();

        renderWithRouter(
            <HeroVisitorActions
                favourite={FAVOURITE}
                favouriteLabel="Favourite"
                guestCtaLabel="Log in for the full experience"
                logIntakeLabel="Log intake"
                onLogIntake={onLogIntake}
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Log intake" }),
        );

        expect(onLogIntake).toHaveBeenCalledTimes(1);
    });
});
