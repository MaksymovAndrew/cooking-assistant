import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AccountSection } from "components/settings/AccountSection";

describe("AccountSection", () => {
    it("should call onChangePassword when Change is clicked", async () => {
        const onChangePassword = jest.fn();

        render(
            <AccountSection
                onChangePassword={onChangePassword}
                onDeleteAccount={jest.fn()}
            />,
        );

        await userEvent.click(screen.getByRole("button", { name: "Change" }));

        expect(onChangePassword).toHaveBeenCalledTimes(1);
    });

    it("should call onDeleteAccount when Delete… is clicked", async () => {
        const onDeleteAccount = jest.fn();

        render(
            <AccountSection
                onChangePassword={jest.fn()}
                onDeleteAccount={onDeleteAccount}
            />,
        );

        await userEvent.click(screen.getByRole("button", { name: "Delete…" }));

        expect(onDeleteAccount).toHaveBeenCalledTimes(1);
    });
});
