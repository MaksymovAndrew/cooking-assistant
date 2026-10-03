import { render, screen } from "@testing-library/react";
import { BookOpen } from "lucide-react";

import { EmptyState } from "components/ui/EmptyState";

const TITLE = "No recipes yet";

describe("EmptyState", () => {
    it("should title a section by default and a page when asked", () => {
        const { rerender } = render(
            <EmptyState icon={BookOpen} title={TITLE} />,
        );

        expect(
            screen.getByRole("heading", { name: TITLE, level: 2 }),
        ).toBeInTheDocument();

        rerender(<EmptyState icon={BookOpen} title={TITLE} titleAs="h1" />);

        expect(
            screen.getByRole("heading", { name: TITLE, level: 1 }),
        ).toBeInTheDocument();
    });
});
