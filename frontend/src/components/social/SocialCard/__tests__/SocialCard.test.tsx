import { render, screen } from "@testing-library/react";

import { SocialCard } from "components/social/SocialCard";

const APP_NAME = "Cooking Assistant";

describe("SocialCard", () => {
    it("should show the record with its label, byline and facts", () => {
        render(
            <SocialCard
                appName={APP_NAME}
                eyebrow="Soup"
                title="Borscht"
                subtitle="by Test U."
                facts={["1 hr 0 min", "320 kcal / portion"]}
            />,
        );

        expect(screen.getByText(APP_NAME)).toBeInTheDocument();
        expect(screen.getByText("Soup")).toBeInTheDocument();
        expect(screen.getByText("Borscht")).toBeInTheDocument();
        expect(screen.getByText("by Test U.")).toBeInTheDocument();
        expect(screen.getByText("320 kcal / portion")).toBeInTheDocument();
    });

    it("should leave out what the record does not have", () => {
        const { container } = render(
            <SocialCard
                appName={APP_NAME}
                eyebrow={null}
                title="Borscht"
                subtitle={null}
                facts={[]}
            />,
        );

        expect(container.textContent).toBe(`${APP_NAME}Borscht`);
    });
});
