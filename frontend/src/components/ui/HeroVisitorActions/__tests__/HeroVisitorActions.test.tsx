import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { HeroVisitorActions } from "components/ui/HeroVisitorActions";

import { renderWithRouter } from "test/router";

describe("HeroVisitorActions", () => {
    it("should show a login CTA linking to /login when the viewer cannot favourite", () => {
        renderWithRouter(
            <HeroVisitorActions
                canFavourite={false}
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

    it("should show a disabled favourite button for a signed-in non-owner", () => {
        renderWithRouter(
            <HeroVisitorActions
                canFavourite
                favouriteLabel="Favourite"
                guestCtaLabel="Log in for the full experience"
                logIntakeLabel="Log intake"
            />,
        );

        expect(
            screen.getByRole("button", { name: "Favourite" }),
        ).toBeDisabled();
        expect(
            screen.queryByRole("button", { name: "Log intake" }),
        ).not.toBeInTheDocument();
    });

    it("should call onLogIntake when the log-intake button is clicked", async () => {
        const onLogIntake = jest.fn();

        renderWithRouter(
            <HeroVisitorActions
                canFavourite
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
