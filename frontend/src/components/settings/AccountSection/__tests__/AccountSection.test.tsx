import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AccountSection } from "components/settings/AccountSection";

import { renderWithRouter } from "test/router";

const EMAIL = "tester@example.com";
const SEND_EMAIL = "Send email";

const baseProps = {
    email: EMAIL,
    emailVerified: false,
    onResendVerification: jest.fn(),
    isResendDisabled: false,
    onChangePassword: jest.fn(),
    onDeleteAccount: jest.fn(),
};

describe("AccountSection", () => {
    it("should link to the profile page from the Profile row", () => {
        renderWithRouter(<AccountSection {...baseProps} />);

        expect(
            screen.getByRole("link", { name: "Open profile" }),
        ).toHaveAttribute("href", "/profile");
    });

    it("should call onChangePassword when Change… is clicked", async () => {
        const onChangePassword = jest.fn();

        renderWithRouter(
            <AccountSection
                {...baseProps}
                onChangePassword={onChangePassword}
            />,
        );

        await userEvent.click(screen.getByRole("button", { name: "Change…" }));

        expect(onChangePassword).toHaveBeenCalledTimes(1);
    });

    it("should call onDeleteAccount when Delete… is clicked", async () => {
        const onDeleteAccount = jest.fn();

        renderWithRouter(
            <AccountSection {...baseProps} onDeleteAccount={onDeleteAccount} />,
        );

        await userEvent.click(screen.getByRole("button", { name: "Delete…" }));

        expect(onDeleteAccount).toHaveBeenCalledTimes(1);
    });

    it("should show the unverified badge and a send-email button for an unverified email", () => {
        renderWithRouter(<AccountSection {...baseProps} />);

        expect(screen.getByText(EMAIL)).toBeInTheDocument();
        expect(screen.getByText("Unverified")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: SEND_EMAIL }),
        ).toBeInTheDocument();
    });

    it("should disable the send-email button while on cooldown", () => {
        renderWithRouter(<AccountSection {...baseProps} isResendDisabled />);

        expect(screen.getByRole("button", { name: SEND_EMAIL })).toBeDisabled();
    });

    it("should show the verified badge and no send-email button for a verified email", () => {
        renderWithRouter(<AccountSection {...baseProps} emailVerified />);

        expect(screen.getByText(EMAIL)).toBeInTheDocument();
        expect(screen.getByText("Verified")).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: SEND_EMAIL }),
        ).not.toBeInTheDocument();
    });

    it("should call onResendVerification when Send email is clicked", async () => {
        const onResendVerification = jest.fn();

        renderWithRouter(
            <AccountSection
                {...baseProps}
                onResendVerification={onResendVerification}
            />,
        );

        await userEvent.click(screen.getByRole("button", { name: SEND_EMAIL }));

        expect(onResendVerification).toHaveBeenCalledTimes(1);
    });
});
