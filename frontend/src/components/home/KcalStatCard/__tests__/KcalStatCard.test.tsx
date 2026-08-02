import { screen } from "@testing-library/react";

import { profileDietaryPath } from "constants/routes";

import { KcalStatCard } from "components/home/KcalStatCard";

import { renderWithRouter } from "test/router";

describe("KcalStatCard", () => {
    it("should show an inviting empty state linking to the dietary tab when no goal is set", () => {
        renderWithRouter(<KcalStatCard consumed={0} goal={null} />);

        expect(screen.getByText("No goal set")).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: /Set a goal/ }),
        ).toHaveAttribute("href", profileDietaryPath());
    });

    it("should show the plain label and formatted value when comfortably under goal", () => {
        renderWithRouter(<KcalStatCard consumed={1180} goal={2200} />);

        expect(screen.getByText("1,180")).toBeInTheDocument();
        expect(screen.getByText("Kcal today")).toBeInTheDocument();
    });

    it("should show the warning tone and percentage near the goal", () => {
        renderWithRouter(<KcalStatCard consumed={1920} goal={2200} />);

        expect(screen.getByText("Kcal today · 87%")).toBeInTheDocument();
        expect(screen.getByTestId("kcal-stat-card")).toHaveClass(
            "kcal-stat-card--near",
        );
    });

    it("should show the over tone once past the goal", () => {
        renderWithRouter(<KcalStatCard consumed={2520} goal={2200} />);

        expect(screen.getByText("Kcal today · over")).toBeInTheDocument();
        expect(screen.getByTestId("kcal-stat-card")).toHaveClass(
            "kcal-stat-card--over",
        );
    });
});
