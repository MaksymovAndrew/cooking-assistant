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

    it("should size each bar against the largest value", () => {
        render(
            <StatBarList
                items={[
                    { label: "Soup", value: 20, displayValue: "00:20" },
                    { label: "Salad", value: 10, displayValue: "00:10" },
                ]}
            />,
        );

        const [soup, salad] = screen.getAllByTestId("stat-bar-fill");

        expect(soup).toHaveStyle({ width: "100%" });
        expect(salad).toHaveStyle({ width: "50%" });
    });

    it("should leave every bar empty, not broken, when all values are zero", () => {
        render(
            <StatBarList
                items={[{ label: "Soup", value: 0, displayValue: "00:00" }]}
            />,
        );

        expect(screen.getByTestId("stat-bar-fill")).toHaveStyle({
            width: "0%",
        });
    });
});
