import { render, screen } from "@testing-library/react";

import { CalorieProgressRing } from "components/calories/CalorieProgressRing";

describe("CalorieProgressRing", () => {
    it("should show the formatted consumed value and goal label", () => {
        render(
            <CalorieProgressRing
                consumed={1180}
                goal={2200}
                tone="normal"
                goalLabel="of 2,200 kcal"
            />,
        );

        expect(screen.getByText("1,180")).toBeInTheDocument();
        expect(screen.getByText("of 2,200 kcal")).toBeInTheDocument();
    });
});
