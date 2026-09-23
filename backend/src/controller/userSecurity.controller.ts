import type { RequestHandler } from "express";

import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from "config/cookie";
import { requestLocale } from "i18n/requestLocale";
import { translateMessage } from "i18n/translate";

import type ChangePassword from "application/use-cases/users/ChangePassword";
import type ConfirmEmailVerification from "application/use-cases/users/ConfirmEmailVerification";
import type ConfirmPasswordReset from "application/use-cases/users/ConfirmPasswordReset";
import type RequestEmailVerification from "application/use-cases/users/RequestEmailVerification";
import type RequestPasswordReset from "application/use-cases/users/RequestPasswordReset";

import { getUserId } from "controller/requestUser";

interface UserSecurityControllerDependencies {
    requestPasswordReset: RequestPasswordReset;
    confirmPasswordReset: ConfirmPasswordReset;
    changePassword: ChangePassword;
    requestEmailVerification: RequestEmailVerification;
    confirmEmailVerification: ConfirmEmailVerification;
}

export default class UserSecurityController {
    private requestPasswordResetUseCase: RequestPasswordReset;
    private confirmPasswordResetUseCase: ConfirmPasswordReset;
    private changePasswordUseCase: ChangePassword;
    private requestEmailVerificationUseCase: RequestEmailVerification;
    private confirmEmailVerificationUseCase: ConfirmEmailVerification;

    constructor({
        requestPasswordReset,
        confirmPasswordReset,
        changePassword,
        requestEmailVerification,
        confirmEmailVerification,
    }: UserSecurityControllerDependencies) {
        this.requestPasswordResetUseCase = requestPasswordReset;
        this.confirmPasswordResetUseCase = confirmPasswordReset;
        this.changePasswordUseCase = changePassword;
        this.requestEmailVerificationUseCase = requestEmailVerification;
        this.confirmEmailVerificationUseCase = confirmEmailVerification;
    }

    requestPasswordReset: RequestHandler = async (req, res) => {
        await this.requestPasswordResetUseCase.execute(
            req.body as Record<string, unknown>,
        );

        res.json({
            message: translateMessage(
                "passwordResetEmailSent",
                requestLocale(req),
            ),
        });
    };

    confirmPasswordReset: RequestHandler = async (req, res) => {
        await this.confirmPasswordResetUseCase.execute(
            req.body as Record<string, unknown>,
        );

        res.json({
            message: translateMessage("passwordReset", requestLocale(req)),
        });
    };

    changePassword: RequestHandler = async (req, res) => {
        const { token } = await this.changePasswordUseCase.execute(
            getUserId(req),
            req.body as Record<string, unknown>,
        );

        res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);
        res.json({
            message: translateMessage("passwordChanged", requestLocale(req)),
        });
    };

    requestEmailVerification: RequestHandler = async (req, res) => {
        await this.requestEmailVerificationUseCase.execute(getUserId(req));

        res.json({
            message: translateMessage(
                "verificationEmailSent",
                requestLocale(req),
            ),
        });
    };

    confirmEmailVerification: RequestHandler = async (req, res) => {
        await this.confirmEmailVerificationUseCase.execute(
            req.body as Record<string, unknown>,
        );

        res.json({
            message: translateMessage("emailVerified", requestLocale(req)),
        });
    };
}
