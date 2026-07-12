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
});
