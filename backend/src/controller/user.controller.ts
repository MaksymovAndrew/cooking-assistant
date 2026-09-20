import type { RequestHandler } from "express";

import { AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from "config/cookie";
import { translateMessage } from "i18n/translate";

import type DeleteAccount from "application/use-cases/users/DeleteAccount";
import type GetCurrentUser from "application/use-cases/users/GetCurrentUser";
import type LoginUser from "application/use-cases/users/LoginUser";
import type RegisterUser from "application/use-cases/users/RegisterUser";
import type UpdateProfile from "application/use-cases/users/UpdateProfile";

import { getOptionalUserId, getUserId } from "controller/requestUser";

interface UserControllerDependencies {
    registerUser: RegisterUser;
    loginUser: LoginUser;
    getCurrentUser: GetCurrentUser;
    updateProfile: UpdateProfile;
    deleteAccount: DeleteAccount;
}

export default class UserController {
    private registerUserUseCase: RegisterUser;
    private loginUserUseCase: LoginUser;
    private getCurrentUserUseCase: GetCurrentUser;
    private updateProfileUseCase: UpdateProfile;
    private deleteAccountUseCase: DeleteAccount;

    constructor({
        registerUser,
        loginUser,
        getCurrentUser,
        updateProfile,
        deleteAccount,
    }: UserControllerDependencies) {
        this.registerUserUseCase = registerUser;
        this.loginUserUseCase = loginUser;
        this.getCurrentUserUseCase = getCurrentUser;
        this.updateProfileUseCase = updateProfile;
        this.deleteAccountUseCase = deleteAccount;
    }

    registerUser: RequestHandler = async (req, res) => {
        const { token } = await this.registerUserUseCase.execute(
            req.body as Record<string, unknown>,
        );

        res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);
        res.status(201).json({ message: translateMessage("registered") });
    };

    loginUser: RequestHandler = async (req, res) => {
        const { token } = await this.loginUserUseCase.execute(
            req.body as Record<string, unknown>,
        );

        res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);
        res.json({ message: translateMessage("loggedIn") });
    };

    logout: RequestHandler = (_req, res) => {
        res.clearCookie(AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS);
        res.json({ message: translateMessage("loggedOut") });
    };

    me: RequestHandler = async (req, res) => {
        const userId = getOptionalUserId(req);
        const user =
            userId === null
                ? null
                : await this.getCurrentUserUseCase.execute(userId);

        res.json(user);
    };

    updateProfile: RequestHandler = async (req, res) => {
        await this.updateProfileUseCase.execute(
            getUserId(req),
            req.body as Record<string, unknown>,
        );

        res.json({ message: translateMessage("profileUpdated") });
    };

    deleteAccount: RequestHandler = async (req, res) => {
        await this.deleteAccountUseCase.execute(
            getUserId(req),
            req.body as Record<string, unknown>,
        );

        res.clearCookie(AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS);
        res.json({ message: translateMessage("accountDeleted") });
    };
}
