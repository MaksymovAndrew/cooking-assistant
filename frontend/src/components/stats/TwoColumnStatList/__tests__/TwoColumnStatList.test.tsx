import { screen } from "@testing-library/react";

import { TwoColumnStatList } from "components/stats/TwoColumnStatList";

import { renderWithRouter } from "test/router";

const LONG_NAME = "Search filter recipe with a very long title";

describe("TwoColumnStatList", () => {
    it("should keep a cut-off name readable in full on hover", () => {
        renderWithRouter(
            <TwoColumnStatList
                left={{
                    label: "Fastest",
                    tone: "success",
                    items: [
                        {
                            key: 1,
                            name: LONG_NAME,
                            value: "5 min",
                            href: "/recipe/1",
                        },
                    ],
                }}
                right={{ label: "Slowest", tone: "warning", items: [] }}
            />,
        );

        expect(screen.getByText(LONG_NAME)).toHaveAttribute("title", LONG_NAME);
    });
});
