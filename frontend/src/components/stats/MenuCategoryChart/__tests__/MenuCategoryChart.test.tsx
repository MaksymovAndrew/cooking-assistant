import { render, screen } from "@testing-library/react";
import { Suspense } from "react";

import { MenuCategoryChart } from "components/stats/MenuCategoryChart";

jest.mock("components/stats/PieChartCard/PieChartCard", () => ({
    __esModule: true,
    default: ({
        data,
        centerLabel,
    }: {
        data: { name: string; value: number }[];
        centerLabel: string;
    }) => (
        <div>
            {data.map((d) => (
                <span key={d.name}>{d.name}</span>
            ))}
            <span>{centerLabel}</span>
        </div>
    ),
}));

describe("MenuCategoryChart", () => {
    it("should name each category and count the menus across all of them in the centre label", async () => {
        render(
            <Suspense fallback={null}>
                <MenuCategoryChart
                    categories={[
                        { categoryName: "Breakfast", menuCount: 1 },
                        { categoryName: "Dinner", menuCount: 1 },
                    ]}
                />
            </Suspense>,
        );

        // one menu per category, so only the summed total makes the label plural
        expect(await screen.findByText("menus")).toBeInTheDocument();
        expect(screen.getByText("Breakfast")).toBeInTheDocument();
        expect(screen.getByText("Dinner")).toBeInTheDocument();
    });
});
