import { screen } from "@testing-library/react";

import { GuestLandingHero } from "components/home/GuestLanding/GuestLandingHero";

import { renderWithRouter } from "test/router";

describe("GuestLandingHero", () => {
    it("should link Register and Log In to their pages", () => {
        renderWithRouter(<GuestLandingHero />);

        expect(screen.getByRole("link", { name: "Sign up" })).toHaveAttribute(
            "href",
            "/registration",
        );
        expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
            "href",
            "/login",
        );
    });
});
