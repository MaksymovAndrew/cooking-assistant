import RequestPasswordReset from "application/use-cases/users/RequestPasswordReset";

import { TEST_FRONTEND_ORIGIN } from "test/helpers/testConstants";

const EMAIL = "user@example.com";
const FRONTEND_ORIGIN = TEST_FRONTEND_ORIGIN;
const RESET_TOKEN = "reset-token";
const HASHED_PASSWORD = "hashed-secret";

describe("RequestPasswordReset", () => {
    const makeDeps = () => ({
        userRepository: {
            findPasswordResetCandidateByEmail: jest.fn(),
        },
        tokenService: { generatePurposeToken: jest.fn() },
        emailSender: { sendPasswordResetEmail: jest.fn() },
    });

    it("should send a reset link bound to the current password hash when the user exists and is verified", async () => {
        const deps = makeDeps();

        deps.userRepository.findPasswordResetCandidateByEmail.mockResolvedValue(
            {
                id: 5,
                password: HASHED_PASSWORD,
                email_verified_at: "2026-01-01T00:00:00.000Z",
            },
        );
        deps.tokenService.generatePurposeToken.mockReturnValue(RESET_TOKEN);
        const useCase = new RequestPasswordReset(
            deps.userRepository,
            deps.tokenService,
            deps.emailSender,
            FRONTEND_ORIGIN,
        );

        await useCase.execute({ email: EMAIL });

        expect(
            deps.userRepository.findPasswordResetCandidateByEmail,
        ).toHaveBeenCalledWith(EMAIL);
        expect(deps.tokenService.generatePurposeToken).toHaveBeenCalledWith(
            5,
            "password-reset",
            expect.any(Number),
            HASHED_PASSWORD,
        );
        expect(deps.emailSender.sendPasswordResetEmail).toHaveBeenCalledWith(
            EMAIL,
            `${FRONTEND_ORIGIN}/reset-password?token=${RESET_TOKEN}`,
        );
    });

    it("should not send an email when no user matches the email", async () => {
        const deps = makeDeps();

        deps.userRepository.findPasswordResetCandidateByEmail.mockResolvedValue(
            null,
        );
        const useCase = new RequestPasswordReset(
            deps.userRepository,
            deps.tokenService,
            deps.emailSender,
            FRONTEND_ORIGIN,
        );

        await useCase.execute({ email: EMAIL });

        expect(deps.emailSender.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it("should not send an email when the user's email is unverified", async () => {
        const deps = makeDeps();

        deps.userRepository.findPasswordResetCandidateByEmail.mockResolvedValue(
            {
                id: 5,
                password: HASHED_PASSWORD,
                email_verified_at: null,
            },
        );
        const useCase = new RequestPasswordReset(
            deps.userRepository,
            deps.tokenService,
            deps.emailSender,
            FRONTEND_ORIGIN,
        );

        await useCase.execute({ email: EMAIL });

        expect(deps.emailSender.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError for a malformed email", async () => {
        const deps = makeDeps();
        const useCase = new RequestPasswordReset(
            deps.userRepository,
            deps.tokenService,
            deps.emailSender,
            FRONTEND_ORIGIN,
        );

        await expect(
            useCase.execute({ email: "not-an-email" }),
        ).rejects.toThrow();
        expect(
            deps.userRepository.findPasswordResetCandidateByEmail,
        ).not.toHaveBeenCalled();
    });
});
