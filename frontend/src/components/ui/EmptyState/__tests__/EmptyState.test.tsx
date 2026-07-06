import { render, screen } from "@testing-library/react";
import { BookOpen } from "lucide-react";

import { Button } from "components/ui/Button";
import { EmptyState } from "components/ui/EmptyState";

describe("EmptyState", () => {
    it("should render the title", () => {
        render(<EmptyState icon={BookOpen} title="No recipes yet" />);

        expect(screen.getByText("No recipes yet")).toBeInTheDocument();
    });

    it("should not render a description when none is given", () => {
        render(<EmptyState icon={BookOpen} title="No recipes yet" />);

        expect(
            screen.queryByText("Your cookbook is empty."),
        ).not.toBeInTheDocument();
    });

    it("should render the description when given", () => {
        render(
            <EmptyState
                icon={BookOpen}
                title="No recipes yet"
                description="Your cookbook is empty."
            />,
        );

        expect(screen.getByText("Your cookbook is empty.")).toBeInTheDocument();
    });

    it("should render the action slot when given", () => {
        render(
            <EmptyState
                icon={BookOpen}
                title="No recipes yet"
                action={<Button>Create your first recipe!</Button>}
            />,
        );

        expect(
            screen.getByRole("button", { name: "Create your first recipe!" }),
        ).toBeInTheDocument();
    });
});
