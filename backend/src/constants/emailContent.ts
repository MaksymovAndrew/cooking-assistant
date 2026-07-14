// every string a user actually sees in a transactional email - kept out of ResendEmailService.ts so a future translation only touches this file
export const EMAIL_CONTENT = {
    brandName: "Cooking Assistant",
    passwordReset: {
        subject: "Reset your password",
        heading: "Reset your password",
        body: "We received a request to reset your Cooking Assistant password. This link expires in 30 minutes.",
        button: "Reset password",
        footer: "If you didn't request this, you can safely ignore this email.",
    },
    verification: {
        subject: "Verify your email",
        heading: "Verify your email",
        body: "Confirm your email address to enable password reset on your Cooking Assistant account.",
        button: "Verify email",
    },
} as const;
