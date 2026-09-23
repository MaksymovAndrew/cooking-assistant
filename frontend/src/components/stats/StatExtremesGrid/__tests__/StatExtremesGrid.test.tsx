import { render, screen } from "@testing-library/react";

import { StatExtremesGrid } from "components/stats/StatExtremesGrid";

const TIME_HEADING = "Cooking time";
const CALORIES_HEADING = "Calories";

const row = (key: number, name: string) => ({ key, name, value: "1" });

describe("StatExtremesGrid", () => {
    it("should render one card per spec with its heading", () => {
        render(
            <StatExtremesGrid
                cards={[
                    {
                        heading: TIME_HEADING,
                        pair: "time",
                        columns: [[], []],
                    },
                    {
                        heading: CALORIES_HEADING,
                        pair: "amount",
                        columns: [[], []],
                    },
                ]}
            />,
        );

        expect(
            screen.getByRole("heading", { name: TIME_HEADING }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("heading", { name: CALORIES_HEADING }),
        ).toBeInTheDocument();
    });

    it("should label a time card fastest and slowest", () => {
        render(
            <StatExtremesGrid
                cards={[
                    {
                        heading: TIME_HEADING,
                        pair: "time",
                        columns: [[row(1, "Soup")], [row(2, "Stew")]],
                    },
                ]}
            />,
        );

        expect(screen.getByText("Fastest")).toBeInTheDocument();
        expect(screen.getByText("Slowest")).toBeInTheDocument();
        expect(screen.getByText("Soup")).toBeInTheDocument();
        expect(screen.getByText("Stew")).toBeInTheDocument();
    });

    it("should label an amount card most and least", () => {
        render(
            <StatExtremesGrid
                cards={[
                    {
                        heading: CALORIES_HEADING,
                        pair: "amount",
                        columns: [[row(1, "Roast")], [row(2, "Salad")]],
                    },
                ]}
            />,
        );

        expect(screen.getByText("Most")).toBeInTheDocument();
        expect(screen.getByText("Least")).toBeInTheDocument();
    });
});
