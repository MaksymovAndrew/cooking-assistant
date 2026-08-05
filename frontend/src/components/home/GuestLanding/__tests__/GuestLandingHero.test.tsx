import { screen } from "@testing-library/react";

import { GuestLandingHero } from "components/home/GuestLanding/GuestLandingHero";

import { renderWithRouter } from "test/router";

describe("GuestLandingHero", () => {
    it("should show the guest badge and heading", () => {
        renderWithRouter(<GuestLandingHero />);

        expect(screen.getByText("Browsing as guest")).toBeInTheDocument();
        expect(
            screen.getByRole("heading", {
                name: "A cookbook you can read before you join.",
            }),
        ).toBeInTheDocument();
    });

    it("should link Register and Log In to their pages", () => {
        renderWithRouter(<GuestLandingHero />);

        expect(screen.getByRole("link", { name: "Register" })).toHaveAttribute(
            "href",
            "/registration",
        );
        expect(screen.getByRole("link", { name: "Log In" })).toHaveAttribute(
            "href",
            "/login",
        );
    });
});
