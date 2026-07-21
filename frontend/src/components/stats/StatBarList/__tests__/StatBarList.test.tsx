import { render, screen } from "@testing-library/react";

import { StatBarList } from "components/stats/StatBarList";

describe("StatBarList", () => {
    it("should render a row per item with its label and display value", () => {
        render(
            <StatBarList
                items={[
                    { label: "Soup", value: 20, displayValue: "00:20" },
                    { label: "Salad", value: 10, displayValue: "00:10" },
                ]}
            />,
        );

        expect(screen.getByText("Soup")).toBeInTheDocument();
        expect(screen.getByText("00:20")).toBeInTheDocument();
        expect(screen.getByText("Salad")).toBeInTheDocument();
        expect(screen.getByText("00:10")).toBeInTheDocument();
    });

    it("should apply the given color to each bar's fill", () => {
        render(
            <StatBarList
                items={[
                    {
                        label: "Soup",
                        value: 20,
                        displayValue: "00:20",
                        color: "#7E60BF",
                    },
                ]}
            />,
        );

        expect(screen.getByTestId("stat-bar-fill")).toHaveStyle({
            backgroundColor: "#7E60BF",
        });
    });
});
