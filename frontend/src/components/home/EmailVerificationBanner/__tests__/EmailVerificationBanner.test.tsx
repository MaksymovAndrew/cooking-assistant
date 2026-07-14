import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { EmailVerificationBanner } from "components/home/EmailVerificationBanner";

const SEND_EMAIL = "Send email";

describe("EmailVerificationBanner", () => {
    it("should show the unverified message and send-email button", () => {
        render(
            <EmailVerificationBanner
                onSendEmail={jest.fn()}
                isSendDisabled={false}
                onDismiss={jest.fn()}
            />,
        );

        expect(
            screen.getByText(
                "Verify your email to enable password reset for your account.",
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: SEND_EMAIL }),
        ).toBeInTheDocument();
    });

    it("should call onSendEmail when the send-email button is clicked", async () => {
        const onSendEmail = jest.fn();

        render(
            <EmailVerificationBanner
                onSendEmail={onSendEmail}
                isSendDisabled={false}
                onDismiss={jest.fn()}
            />,
        );

        await userEvent.click(screen.getByRole("button", { name: SEND_EMAIL }));

        expect(onSendEmail).toHaveBeenCalledTimes(1);
    });

    it("should disable the send-email button while on cooldown", () => {
        render(
            <EmailVerificationBanner
                onSendEmail={jest.fn()}
                isSendDisabled
                onDismiss={jest.fn()}
            />,
        );

        expect(screen.getByRole("button", { name: SEND_EMAIL })).toBeDisabled();
    });

    it("should call onDismiss when the later button is clicked", async () => {
        const onDismiss = jest.fn();

        render(
            <EmailVerificationBanner
                onSendEmail={jest.fn()}
                isSendDisabled={false}
                onDismiss={onDismiss}
            />,
        );

        await userEvent.click(screen.getByRole("button", { name: "Later" }));

        expect(onDismiss).toHaveBeenCalledTimes(1);
    });
});
