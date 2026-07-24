import type { RequestHandler } from "express";

import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from "config/cookie";
import { SUCCESS_MESSAGES } from "constants/errorMessages";

import type ChangePassword from "application/use-cases/users/ChangePassword";
import type ConfirmEmailVerification from "application/use-cases/users/ConfirmEmailVerification";
import type ConfirmPasswordReset from "application/use-cases/users/ConfirmPasswordReset";
import type DeleteAccount from "application/use-cases/users/DeleteAccount";
import type GetCurrentUser from "application/use-cases/users/GetCurrentUser";
import type GetUsers from "application/use-cases/users/GetUsers";
import type LoginUser from "application/use-cases/users/LoginUser";
import type RegisterUser from "application/use-cases/users/RegisterUser";
import type RequestEmailVerification from "application/use-cases/users/RequestEmailVerification";
import type RequestPasswordReset from "application/use-cases/users/RequestPasswordReset";
import type UpdateProfile from "application/use-cases/users/UpdateProfile";

import { getUserId } from "controller/requestUser";

interface UserControllerDependencies {
    registerUser: RegisterUser;
    loginUser: LoginUser;
    getUsers: GetUsers;
    getCurrentUser: GetCurrentUser;
    requestPasswordReset: RequestPasswordReset;
    confirmPasswordReset: ConfirmPasswordReset;
    changePassword: ChangePassword;
    updateProfile: UpdateProfile;
    deleteAccount: DeleteAccount;
    requestEmailVerification: RequestEmailVerification;
    confirmEmailVerification: ConfirmEmailVerification;
}

export default class UserController {
    private registerUserUseCase: RegisterUser;
    private loginUserUseCase: LoginUser;
    private getUsersUseCase: GetUsers;
    private getCurrentUserUseCase: GetCurrentUser;
    private requestPasswordResetUseCase: RequestPasswordReset;
    private confirmPasswordResetUseCase: ConfirmPasswordReset;
    private changePasswordUseCase: ChangePassword;
    private updateProfileUseCase: UpdateProfile;
    private deleteAccountUseCase: DeleteAccount;
    private requestEmailVerificationUseCase: RequestEmailVerification;
    private confirmEmailVerificationUseCase: ConfirmEmailVerification;

    constructor({
        registerUser,
        loginUser,
        getUsers,
        getCurrentUser,
        requestPasswordReset,
        confirmPasswordReset,
        changePassword,
        updateProfile,
        deleteAccount,
        requestEmailVerification,
        confirmEmailVerification,
    }: UserControllerDependencies) {
        this.registerUserUseCase = registerUser;
        this.loginUserUseCase = loginUser;
        this.getUsersUseCase = getUsers;
        this.getCurrentUserUseCase = getCurrentUser;
        this.requestPasswordResetUseCase = requestPasswordReset;
        this.confirmPasswordResetUseCase = confirmPasswordReset;
        this.changePasswordUseCase = changePassword;
        this.updateProfileUseCase = updateProfile;
        this.deleteAccountUseCase = deleteAccount;
        this.requestEmailVerificationUseCase = requestEmailVerification;
        this.confirmEmailVerificationUseCase = confirmEmailVerification;
    }

    registerUser: RequestHandler = async (req, res) => {
        const { token } = await this.registerUserUseCase.execute(
            req.body as Record<string, unknown>,
        );

        res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);
        res.status(201).json({ message: SUCCESS_MESSAGES.REGISTERED });
    };

    loginUser: RequestHandler = async (req, res) => {
        const { token } = await this.loginUserUseCase.execute(
            req.body as Record<string, unknown>,
        );

        res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);
        res.json({ message: SUCCESS_MESSAGES.LOGGED_IN });
    };

    logout: RequestHandler = (_req, res) => {
        res.clearCookie(AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS);
        res.json({ message: SUCCESS_MESSAGES.LOGGED_OUT });
    };

    me: RequestHandler = async (req, res) => {
        const user = await this.getCurrentUserUseCase.execute(getUserId(req));

        res.json(user);
    };

    getUsers: RequestHandler = async (_req, res) => {
        const users = await this.getUsersUseCase.execute();

        res.json(users);
    };

    requestPasswordReset: RequestHandler = async (req, res) => {
        await this.requestPasswordResetUseCase.execute(
            req.body as Record<string, unknown>,
        );

        res.json({ message: SUCCESS_MESSAGES.PASSWORD_RESET_EMAIL_SENT });
    };

    confirmPasswordReset: RequestHandler = async (req, res) => {
        await this.confirmPasswordResetUseCase.execute(
            req.body as Record<string, unknown>,
        );

        res.json({ message: SUCCESS_MESSAGES.PASSWORD_RESET });
    };

    changePassword: RequestHandler = async (req, res) => {
        await this.changePasswordUseCase.execute(
            getUserId(req),
            req.body as Record<string, unknown>,
        );

        res.json({ message: SUCCESS_MESSAGES.PASSWORD_CHANGED });
    };

    updateProfile: RequestHandler = async (req, res) => {
        await this.updateProfileUseCase.execute(
            getUserId(req),
            req.body as Record<string, unknown>,
        );

        res.json({ message: SUCCESS_MESSAGES.PROFILE_UPDATED });
    };

    deleteAccount: RequestHandler = async (req, res) => {
        await this.deleteAccountUseCase.execute(
            getUserId(req),
            req.body as Record<string, unknown>,
        );

        res.clearCookie(AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS);
        res.json({ message: SUCCESS_MESSAGES.ACCOUNT_DELETED });
    };

    requestEmailVerification: RequestHandler = async (req, res) => {
        await this.requestEmailVerificationUseCase.execute(getUserId(req));

        res.json({ message: SUCCESS_MESSAGES.VERIFICATION_EMAIL_SENT });
    };

    confirmEmailVerification: RequestHandler = async (req, res) => {
        await this.confirmEmailVerificationUseCase.execute(
            req.body as Record<string, unknown>,
        );

        res.json({ message: SUCCESS_MESSAGES.EMAIL_VERIFIED });
    };
}
