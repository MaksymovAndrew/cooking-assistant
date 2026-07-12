import { render, screen } from "@testing-library/react";
import { Heart } from "lucide-react";

import { ProfileComingSoon } from "components/profile/ProfileComingSoon";

describe("ProfileComingSoon", () => {
    it("should render the given title and a coming-soon description", () => {
        render(<ProfileComingSoon icon={Heart} title="Favourites" />);

        expect(screen.getByText("Favourites")).toBeInTheDocument();
        expect(
            screen.getByText("Coming in a future release."),
        ).toBeInTheDocument();
    });
});
