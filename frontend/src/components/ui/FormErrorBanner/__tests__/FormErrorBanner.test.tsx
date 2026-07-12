import { render, screen } from "@testing-library/react";

import { FormErrorBanner } from "components/ui/FormErrorBanner";

describe("FormErrorBanner", () => {
    it("should render the message as an alert", () => {
        render(<FormErrorBanner message="Incorrect username or password." />);

        expect(screen.getByRole("alert")).toHaveTextContent(
            "Incorrect username or password.",
        );
    });
});
