import { render, screen } from "@testing-library/react";
import { Suspense } from "react";

import { MenuCategoryChart } from "components/stats/MenuCategoryChart";

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

describe("MenuCategoryChart", () => {
    it("should render the chart and pass categories to the donut", async () => {
        render(
            <Suspense fallback={null}>
                <MenuCategoryChart
                    categories={[{ categoryname: "Breakfast", menuCount: 3 }]}
                />
            </Suspense>,
        );

        expect(await screen.findByTestId("donut-chart")).toBeInTheDocument();
        expect(screen.getByText("Breakfast")).toBeInTheDocument();
    });

    it("should render with empty categories without errors", async () => {
        render(
            <Suspense fallback={null}>
                <MenuCategoryChart categories={[]} />
            </Suspense>,
        );

        expect(await screen.findByTestId("donut-chart")).toBeInTheDocument();
    });
});
