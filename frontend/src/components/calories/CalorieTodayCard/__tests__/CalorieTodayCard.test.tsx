import { render, screen } from "@testing-library/react";

import { CalorieTodayCard } from "components/calories/CalorieTodayCard";

describe("CalorieTodayCard", () => {
    it("should show the on-track tone and eaten/remaining legend", () => {
        render(
            <CalorieTodayCard
                consumed={1180}
                goal={2200}
                remaining={1020}
                over={0}
                isOverLimit={false}
                tone="normal"
            />,
        );

        expect(screen.getByText("On track")).toBeInTheDocument();
        expect(
            screen.getByText(
                "You've eaten 1,180 kcal of your 2,200 kcal goal - 1,020 kcal left.",
            ),
        ).toBeInTheDocument();
        expect(screen.getByText("Eaten")).toBeInTheDocument();
        expect(screen.getByText("Remaining")).toBeInTheDocument();
    });

    it("should show the near-limit tone", () => {
        render(
            <CalorieTodayCard
                consumed={1920}
                goal={2200}
                remaining={280}
                over={0}
                isOverLimit={false}
                tone="near"
            />,
        );

        expect(screen.getByText("Close to your goal")).toBeInTheDocument();
    });

    it("should show the over-goal tone with a Goal/Over legend", () => {
        render(
            <CalorieTodayCard
                consumed={2520}
                goal={2200}
                remaining={0}
                over={320}
                isOverLimit
                tone="over"
            />,
        );

        expect(screen.getByText("Over goal")).toBeInTheDocument();
        expect(
            screen.getByText(
                "You've eaten 2,520 kcal, 320 kcal over your 2,200 kcal goal.",
            ),
        ).toBeInTheDocument();
        expect(screen.getByText("Goal")).toBeInTheDocument();
        expect(screen.getByText("Over")).toBeInTheDocument();
    });
});
