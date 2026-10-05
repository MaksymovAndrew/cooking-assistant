import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { HeroVisitorActions } from "components/ui/HeroVisitorActions";

import { renderWithRouter } from "test/router";

const LOG_INTAKE_LABEL = "Log intake";
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
                shareTitle="Borscht"
                guestCtaLabel="Log in for the full experience"
                logIntakeLabel={LOG_INTAKE_LABEL}
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
        expect(screen.getByRole("button", { name: "Share" })).toBeEnabled();
    });

    it("should show the favourite toggle for a signed-in non-owner", () => {
        renderWithRouter(
            <HeroVisitorActions
                favourite={FAVOURITE}
                favouriteLabel="Favourite"
                shareTitle="Borscht"
                guestCtaLabel="Log in for the full experience"
                logIntakeLabel={LOG_INTAKE_LABEL}
            />,
        );

        expect(
            screen.getByRole("button", { name: "Favourite" }),
        ).toHaveAttribute("aria-pressed", "false");
        expect(
            screen.queryByRole("button", { name: LOG_INTAKE_LABEL }),
        ).not.toBeInTheDocument();
    });

    it("should call onLogIntake when the log-intake button is clicked", async () => {
        const onLogIntake = jest.fn();

        renderWithRouter(
            <HeroVisitorActions
                favourite={FAVOURITE}
                favouriteLabel="Favourite"
                shareTitle="Borscht"
                guestCtaLabel="Log in for the full experience"
                logIntakeLabel={LOG_INTAKE_LABEL}
                onLogIntake={onLogIntake}
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: LOG_INTAKE_LABEL }),
        );

        expect(onLogIntake).toHaveBeenCalledTimes(1);
    });

    it("should call onCook when the cooked-it button is clicked", async () => {
        const onCook = jest.fn();

        renderWithRouter(
            <HeroVisitorActions
                favourite={FAVOURITE}
                favouriteLabel="Favourite"
                shareTitle="Borscht"
                guestCtaLabel="Log in for the full experience"
                logIntakeLabel={LOG_INTAKE_LABEL}
                cookLabel="Cooked it"
                onCook={onCook}
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Cooked it" }),
        );

        expect(onCook).toHaveBeenCalledTimes(1);
    });

    it("should put the cooking actions first, so focus follows what the eye reads", () => {
        renderWithRouter(
            <HeroVisitorActions
                favourite={FAVOURITE}
                favouriteLabel="Favourite"
                shareTitle="Borscht"
                guestCtaLabel="Log in for the full experience"
                logIntakeLabel={LOG_INTAKE_LABEL}
                onLogIntake={jest.fn()}
                cookLabel="Cooked it"
                onCook={jest.fn()}
            />,
        );

        expect(
            screen.getAllByRole("button").map((button) => button.textContent),
        ).toEqual(["Cooked it", LOG_INTAKE_LABEL, "Favourite", "Share"]);
    });
});
