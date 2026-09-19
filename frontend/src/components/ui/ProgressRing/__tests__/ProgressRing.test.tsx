import { render, screen } from "@testing-library/react";

import { ProgressRing } from "components/ui/ProgressRing";

const ARC_TEST_ID = "progress-ring-arc";

describe("ProgressRing", () => {
    it("should draw the arc as a share of a 100-unit path", () => {
        render(<ProgressRing fraction={0.25} size={46} thickness={5} />);

        const arc = screen.getByTestId(ARC_TEST_ID);

        expect(arc).toHaveAttribute("stroke-dashoffset", "75");
        expect(arc).toHaveAttribute("r", "20.5");
    });

    it("should clamp a fraction above one to a full ring", () => {
        render(<ProgressRing fraction={1.4} size={46} thickness={5} />);

        expect(screen.getByTestId(ARC_TEST_ID)).toHaveAttribute(
            "stroke-dashoffset",
            "0",
        );
    });

    it("should leave the arc out for an empty ring", () => {
        render(<ProgressRing fraction={0} size={46} thickness={5} />);

        expect(screen.queryByTestId(ARC_TEST_ID)).not.toBeInTheDocument();
    });

    it("should keep the ring clear of the edge by the inset", () => {
        render(
            <ProgressRing fraction={0.5} size={140} thickness={22} inset={7} />,
        );

        expect(screen.getByTestId(ARC_TEST_ID)).toHaveAttribute("r", "52");
    });

    it("should render its centre content", () => {
        render(
            <ProgressRing fraction={0.5} size={46} thickness={5}>
                50%
            </ProgressRing>,
        );

        expect(screen.getByText("50%")).toBeInTheDocument();
    });
});
