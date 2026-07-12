import { render, screen } from "@testing-library/react";
import { Suspense } from "react";

import { RecipeTypeChart } from "components/stats/RecipeTypeChart";

jest.mock("components/stats/PieChartCard/PieChartCard", () => ({
    __esModule: true,
    default: ({ data }: { data: { name: string; value: number }[] }) => (
        <div data-testid="donut-chart">
            {data.map((d) => (
                <span key={d.name}>{d.name}</span>
            ))}
        </div>
    ),
}));

describe("RecipeTypeChart", () => {
    it("should render the chart and pass stats to the donut", async () => {
        render(
            <Suspense fallback={null}>
                <RecipeTypeChart stats={[{ typeName: "Soup", count: 3 }]} />
            </Suspense>,
        );

        expect(await screen.findByTestId("donut-chart")).toBeInTheDocument();
        expect(screen.getByText("Soup")).toBeInTheDocument();
    });

    it("should render with empty stats without errors", async () => {
        render(
            <Suspense fallback={null}>
                <RecipeTypeChart stats={[]} />
            </Suspense>,
        );

        expect(await screen.findByTestId("donut-chart")).toBeInTheDocument();
    });
});
