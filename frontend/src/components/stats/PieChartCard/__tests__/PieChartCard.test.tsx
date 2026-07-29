import { render, screen } from "@testing-library/react";

import {
    getChartColor,
    STATS_PALETTE,
} from "components/stats/PieChartCard/chartColors";
import PieChartCard from "components/stats/PieChartCard/PieChartCard";

jest.mock("recharts", () => ({
    PieChart: ({ children }: { children: React.ReactNode }) => (
        <svg data-testid="pie-chart">{children}</svg>
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
    it("should render the pie chart container", () => {
        render(
            <PieChartCard
                data={[{ name: "Soup", value: 4 }]}
                centerLabel="recipes"
            />,
        );

        expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
    });

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

    it("should display the given center label", () => {
        render(
            <PieChartCard
                data={[{ name: "Soup", value: 1 }]}
                centerLabel="recipes"
            />,
        );

        expect(screen.getByText("recipes")).toBeInTheDocument();
    });

    it("should render with empty data showing zero total", () => {
        render(<PieChartCard data={[]} centerLabel="recipes" />);

        expect(screen.getByText("0")).toBeInTheDocument();
        expect(screen.queryAllByTestId("cell")).toHaveLength(0);
    });

    it("should cycle colors when data exceeds palette size", () => {
        const data = Array.from({ length: 7 }, (_, i) => ({
            name: `Type${i}`,
            value: 1,
        }));

        render(<PieChartCard data={data} centerLabel="recipes" />);

        const cells = screen.getAllByTestId("cell");

        expect(cells).toHaveLength(7);
        expect(cells[6]).toHaveAttribute(
            "data-fill",
            STATS_PALETTE[6 % STATS_PALETTE.length],
        );
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

    it("should render no legend entries for empty data", () => {
        render(<PieChartCard data={[]} centerLabel="recipes" />);

        expect(screen.queryByText("Soup")).toBeNull();
    });
});

describe("getChartColor", () => {
    it("should return the color at the given index", () => {
        expect(getChartColor(0)).toBe(STATS_PALETTE[0]);
        expect(getChartColor(2)).toBe(STATS_PALETTE[2]);
    });

    it("should wrap around when index exceeds palette length", () => {
        expect(getChartColor(STATS_PALETTE.length)).toBe(STATS_PALETTE[0]);
        expect(getChartColor(STATS_PALETTE.length + 1)).toBe(STATS_PALETTE[1]);
    });
});
