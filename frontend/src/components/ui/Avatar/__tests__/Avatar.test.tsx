import { render, screen } from "@testing-library/react";

import { Avatar } from "components/ui/Avatar";

const AVATAR_PRESET_TEST_ID = "avatar-preset";

describe("Avatar", () => {
    it("should render the initials when no avatarKey is given", () => {
        render(<Avatar initials="AB" />);

        expect(screen.getByText("AB")).toBeInTheDocument();
    });

    it("should render a preset SVG when avatarKey matches the registry", () => {
        render(<Avatar initials="AB" avatarKey="tomato" />);

        expect(screen.getByTestId(AVATAR_PRESET_TEST_ID)).toBeInTheDocument();
        expect(screen.queryByText("AB")).not.toBeInTheDocument();
    });

    it("should render an uploaded photo ahead of the preset", () => {
        render(
            <Avatar
                initials="AB"
                avatarKey="tomato"
                photoKey="0b8f5a3e-2c4d-4e6f-8a1b-3c5d7e9f1a2b"
            />,
        );

        expect(screen.getByRole("presentation")).toBeInTheDocument();
        expect(
            screen.queryByTestId(AVATAR_PRESET_TEST_ID),
        ).not.toBeInTheDocument();
    });

    it("should fall back to initials when avatarKey is unknown", () => {
        render(<Avatar initials="AB" avatarKey="not-a-real-avatar" />);

        expect(screen.getByText("AB")).toBeInTheDocument();
        expect(
            screen.queryByTestId(AVATAR_PRESET_TEST_ID),
        ).not.toBeInTheDocument();
    });

    it("should fall back to the icon placeholder when neither initials nor a valid avatarKey are given", () => {
        render(<Avatar />);

        expect(
            screen.queryByTestId(AVATAR_PRESET_TEST_ID),
        ).not.toBeInTheDocument();
        expect(screen.queryByText(/./)).not.toBeInTheDocument();
    });
});
