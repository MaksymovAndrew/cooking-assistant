import { render, screen } from "@testing-library/react";

import type { ExpiringIngredient } from "types/expiry";

import { ExpiringItem } from "components/home/ExpiringSoon/ExpiringItem";

const buildItem = (
    tone: ExpiringIngredient["status"]["tone"],
    days: number,
): ExpiringIngredient => ({
    ingredientId: 1,
    slug: "milk",
    name: "Milk",
    status: { tone, days },
});

describe("ExpiringItem", () => {
    it("should show the Expired badge for an expired ingredient", () => {
        render(<ExpiringItem item={buildItem("expired", -2)} />);

        expect(screen.getByText("Milk")).toBeInTheDocument();
        expect(screen.getByText("Expired")).toBeInTheDocument();
    });

    it("should show the days-left badge for a warning ingredient", () => {
        render(<ExpiringItem item={buildItem("warning", 3)} />);

        expect(screen.getByText("3 days")).toBeInTheDocument();
    });
});
