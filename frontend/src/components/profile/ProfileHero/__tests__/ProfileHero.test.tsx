import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ProfileHero } from "components/profile/ProfileHero";

describe("ProfileHero", () => {
    it("should render the full name and stats", () => {
        render(
            <ProfileHero
                name="Claude"
                surname="Cook"
                recipesCount={5}
                menusCount={2}
                onLogout={jest.fn()}
                onEditProfile={jest.fn()}
            />,
        );

        expect(screen.getByText("Claude Cook")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
        expect(screen.getByText("15")).toBeInTheDocument();
    });

    it("should fall back to the login when name/surname are missing", () => {
        render(
            <ProfileHero
                login="claude"
                recipesCount={0}
                menusCount={0}
                onLogout={jest.fn()}
                onEditProfile={jest.fn()}
            />,
        );

        expect(screen.getByText("claude")).toBeInTheDocument();
    });

    it("should render the joined date when createdAt is provided", () => {
        render(
            <ProfileHero
                name="Claude"
                surname="Cook"
                createdAt="2025-06-15"
                recipesCount={0}
                menusCount={0}
                onLogout={jest.fn()}
                onEditProfile={jest.fn()}
            />,
        );

        expect(screen.getByText("Joined Jun 2025")).toBeInTheDocument();
    });

    it("should not render a joined date when createdAt is missing", () => {
        render(
            <ProfileHero
                name="Claude"
                surname="Cook"
                recipesCount={0}
                menusCount={0}
                onLogout={jest.fn()}
                onEditProfile={jest.fn()}
            />,
        );

        expect(screen.queryByText(/^Joined/)).not.toBeInTheDocument();
    });

    it("should call onEditProfile when the Edit profile button is clicked", async () => {
        const onEditProfile = jest.fn();

        render(
            <ProfileHero
                name="Claude"
                surname="Cook"
                recipesCount={0}
                menusCount={0}
                onLogout={jest.fn()}
                onEditProfile={onEditProfile}
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Edit profile" }),
        );

        expect(onEditProfile).toHaveBeenCalledTimes(1);
    });

    it("should call onLogout when the mobile logout button is clicked", async () => {
        const onLogout = jest.fn();

        render(
            <ProfileHero
                name="Claude"
                surname="Cook"
                recipesCount={0}
                menusCount={0}
                onLogout={onLogout}
                onEditProfile={jest.fn()}
            />,
        );

        await userEvent.click(screen.getByRole("button", { name: "Logout" }));

        expect(onLogout).toHaveBeenCalledTimes(1);
    });
});
