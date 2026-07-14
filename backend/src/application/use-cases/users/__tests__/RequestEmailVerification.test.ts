import { NotFoundError, ValidationError } from "domain/errors/AppError";

import RequestEmailVerification from "application/use-cases/users/RequestEmailVerification";

import { catchError } from "test/helpers/assertions";
import { TEST_FRONTEND_ORIGIN } from "test/helpers/testConstants";

const USER_ID = 5;
const EMAIL = "user@example.com";
const FRONTEND_ORIGIN = TEST_FRONTEND_ORIGIN;
const VERIFY_TOKEN = "verify-token";

describe("RequestEmailVerification", () => {
    const makeDeps = () => ({
        userRepository: { findById: jest.fn() },
        tokenService: { generatePurposeToken: jest.fn() },
        emailSender: { sendVerificationEmail: jest.fn() },
    });

    it("should send a verification link for an unverified email on file", async () => {
        const deps = makeDeps();

        deps.userRepository.findById.mockResolvedValue({
            id: USER_ID,
            email: EMAIL,
            email_verified_at: null,
        });
        deps.tokenService.generatePurposeToken.mockReturnValue(VERIFY_TOKEN);
        const useCase = new RequestEmailVerification(
            deps.userRepository,
            deps.tokenService,
            deps.emailSender,
            FRONTEND_ORIGIN,
        );

        await useCase.execute(USER_ID);

        expect(deps.emailSender.sendVerificationEmail).toHaveBeenCalledWith(
            EMAIL,
            `${FRONTEND_ORIGIN}/verify-email?token=${VERIFY_TOKEN}`,
        );
    });

    it("should throw a 404 NotFoundError when the user does not exist", async () => {
        const deps = makeDeps();

        deps.userRepository.findById.mockResolvedValue(null);
        const useCase = new RequestEmailVerification(
            deps.userRepository,
            deps.tokenService,
            deps.emailSender,
            FRONTEND_ORIGIN,
        );

        const error = await catchError(useCase.execute(USER_ID));

        expect(error).toBeAppError(NotFoundError, "User not found", 404);
        expect(deps.emailSender.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError when the email is already verified", async () => {
        const deps = makeDeps();

        deps.userRepository.findById.mockResolvedValue({
            id: USER_ID,
            email: EMAIL,
            email_verified_at: "2026-01-01T00:00:00.000Z",
        });
        const useCase = new RequestEmailVerification(
            deps.userRepository,
            deps.tokenService,
            deps.emailSender,
            FRONTEND_ORIGIN,
        );

        const error = await catchError(useCase.execute(USER_ID));

        expect(error).toBeAppError(
            ValidationError,
            "Email is already verified",
            400,
        );
        expect(deps.emailSender.sendVerificationEmail).not.toHaveBeenCalled();
    });
});
