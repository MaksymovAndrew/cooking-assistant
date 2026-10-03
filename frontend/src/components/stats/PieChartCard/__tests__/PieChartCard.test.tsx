import { render, screen } from "@testing-library/react";

import {
    getChartColor,
    NEUTRAL_CHART_COLOR,
    STATS_PALETTE,
} from "components/stats/PieChartCard/chartColors";
import PieChartCard from "components/stats/PieChartCard/PieChartCard";

jest.mock("recharts", () => ({
    PieChart: ({ children }: { children: React.ReactNode }) => (
        <svg>{children}</svg>
    ),
    // real recharts 3 invokes Pie's shape prop once per datum instead of taking Cell children
    Pie: ({
        data,
        shape,
    }: {
        data: { name: string; value: number }[];
        shape: (props: { index: number }) => React.ReactNode;
    }) => (
        <g data-testid="pie">
            {data.map((d, index) => (
                <g key={d.name}>{shape({ index })}</g>
            ))}
        </g>
    ),
    Sector: ({ fill }: { fill: string }) => (
        <rect data-testid="cell" data-fill={fill} />
    ),
    Tooltip: () => null,
}));

describe("PieChartCard", () => {
    it("should render one cell per datum with palette colors", () => {
        render(
            <PieChartCard
                data={[
                    { name: "Soup", value: 4 },
                    { name: "Dessert", value: 2 },
                ]}
                centerLabel="recipes"
            />,
        );

        const cells = screen.getAllByTestId("cell");

        expect(cells).toHaveLength(2);
        expect(cells[0]).toHaveAttribute("data-fill", STATS_PALETTE[0]);
        expect(cells[1]).toHaveAttribute("data-fill", STATS_PALETTE[1]);
    });

    it("should paint a datum that brings its own color with it and leave the palette to the rest", () => {
        render(
            <PieChartCard
                data={[
                    { name: "Drink", value: 4 },
                    { name: "No type", value: 2, color: NEUTRAL_CHART_COLOR },
                ]}
                centerLabel="recipes"
            />,
        );

        const cells = screen.getAllByTestId("cell");

        expect(cells[0]).toHaveAttribute("data-fill", STATS_PALETTE[0]);
        expect(cells[1]).toHaveAttribute("data-fill", NEUTRAL_CHART_COLOR);
    });

    it("should display the total value in the center", () => {
        render(
            <PieChartCard
                data={[
                    { name: "Soup", value: 6 },
                    { name: "Dessert", value: 9 },
                ]}
                centerLabel="recipes"
            />,
        );

        expect(screen.getByText("15")).toBeInTheDocument();
    });

    it("should render with empty data showing zero total", () => {
        render(<PieChartCard data={[]} centerLabel="recipes" />);

        expect(screen.getByText("0")).toBeInTheDocument();
        expect(screen.queryAllByTestId("cell")).toHaveLength(0);
    });

    it("should render a legend row with the name and value for each datum", () => {
        render(
            <PieChartCard
                data={[
                    { name: "Soup", value: 6 },
                    { name: "Dessert", value: 9 },
                ]}
                centerLabel="recipes"
            />,
        );

        expect(screen.getByText("Soup")).toBeInTheDocument();
        expect(screen.getByText("6")).toBeInTheDocument();
        expect(screen.getByText("Dessert")).toBeInTheDocument();
        expect(screen.getByText("9")).toBeInTheDocument();
    });
});

describe("getChartColor", () => {
    it("should wrap around when index exceeds palette length", () => {
        expect(getChartColor(STATS_PALETTE.length)).toBe(STATS_PALETTE[0]);
        expect(getChartColor(STATS_PALETTE.length + 1)).toBe(STATS_PALETTE[1]);
    });
});
