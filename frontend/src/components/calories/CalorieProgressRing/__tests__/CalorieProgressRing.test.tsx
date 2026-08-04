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

    it("should apply the near tone class when close to the goal", () => {
        render(
            <CalorieProgressRing
                consumed={1920}
                goal={2200}
                tone="near"
                goalLabel="of 2,200 kcal"
            />,
        );

        expect(screen.getByTestId("calorie-progress-ring")).toHaveClass(
            "calorie-progress-ring--near",
        );
    });

    it("should apply the over tone class and clamp the arc at a full ring", () => {
        render(
            <CalorieProgressRing
                consumed={2520}
                goal={2200}
                tone="over"
                goalLabel="of 2,200 kcal"
            />,
        );

        expect(screen.getByTestId("calorie-progress-ring")).toHaveClass(
            "calorie-progress-ring--over",
        );

        const arc = screen.getByTestId("calorie-progress-ring-arc");
        const dashArray = arc.getAttribute("stroke-dasharray") ?? "";
        const [drawn, total] = dashArray.split(" ").map(Number);

        expect(drawn).toBeCloseTo(total);
    });
});
