import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AccountSection } from "components/settings/AccountSection";

import { renderWithRouter } from "test/router";

describe("AccountSection", () => {
    it("should link to the profile page from the Profile row", () => {
        renderWithRouter(
            <AccountSection
                onChangePassword={jest.fn()}
                onDeleteAccount={jest.fn()}
            />,
        );

        expect(
            screen.getByRole("link", { name: "Open profile" }),
        ).toHaveAttribute("href", "/profile");
    });

    it("should call onChangePassword when Change… is clicked", async () => {
        const onChangePassword = jest.fn();

        renderWithRouter(
            <AccountSection
                onChangePassword={onChangePassword}
                onDeleteAccount={jest.fn()}
            />,
        );

        await userEvent.click(screen.getByRole("button", { name: "Change…" }));

        expect(onChangePassword).toHaveBeenCalledTimes(1);
    });

    it("should call onDeleteAccount when Delete… is clicked", async () => {
        const onDeleteAccount = jest.fn();

        renderWithRouter(
            <AccountSection
                onChangePassword={jest.fn()}
                onDeleteAccount={onDeleteAccount}
            />,
        );

        await userEvent.click(screen.getByRole("button", { name: "Delete…" }));

        expect(onDeleteAccount).toHaveBeenCalledTimes(1);
    });
});
