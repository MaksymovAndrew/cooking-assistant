import { render, screen } from "@testing-library/react";
import { Suspense } from "react";

import { RecipeTypeChart } from "components/stats/RecipeTypeChart";

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

describe("RecipeTypeChart", () => {
    it("should name each type and count the recipes across all of them in the centre label", async () => {
        render(
            <Suspense fallback={null}>
                <RecipeTypeChart
                    stats={[
                        { typeName: "Main course", count: 1 },
                        { typeName: "Dessert", count: 1 },
                    ]}
                />
            </Suspense>,
        );

        // one recipe per type, so only the summed total makes the label plural
        expect(await screen.findByText("recipes")).toBeInTheDocument();
        expect(screen.getByText("Main course")).toBeInTheDocument();
        expect(screen.getByText("Dessert")).toBeInTheDocument();
    });

    it("should give the recipes without a type a slice of their own and count them in the total", async () => {
        render(
            <Suspense fallback={null}>
                <RecipeTypeChart
                    stats={[
                        { typeName: "Dessert", count: 1 },
                        { typeName: null, count: 1 },
                    ]}
                />
            </Suspense>,
        );

        expect(await screen.findByText("recipes")).toBeInTheDocument();
        expect(screen.getByText("No type")).toBeInTheDocument();
    });
});
