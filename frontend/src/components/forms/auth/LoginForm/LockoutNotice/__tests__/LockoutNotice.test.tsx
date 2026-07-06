import { render, screen } from "@testing-library/react";

import { LockoutNotice } from "components/forms/auth/LoginForm/LockoutNotice";

describe("LockoutNotice", () => {
    it("should show the lockout heading and the formatted countdown", () => {
        render(<LockoutNotice remainingMs={65_000} totalMs={300_000} />);

        expect(
            screen.getByText("Too many attempts - account locked."),
        ).toBeInTheDocument();
        expect(screen.getByText("1:05")).toBeInTheDocument();
    });

    it("should render at full width when no total duration is known", () => {
        render(<LockoutNotice remainingMs={20_000} totalMs={null} />);

        expect(screen.getByRole("alert")).toBeInTheDocument();
    });
});
