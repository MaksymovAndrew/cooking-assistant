import express, { type Router } from "express";

import type UserController from "controller/user.controller";
import authenticateToken from "middleware/jwtMiddleware";
import {
    changePasswordLimiter,
    confirmEmailLimiter,
    deleteAccountLimiter,
    forgotPasswordLimiter,
    loginIpLimiter,
    loginLimiter,
    registerIpLimiter,
    registerLimiter,
    resendVerificationLimiter,
    resetPasswordLimiter,
} from "middleware/rateLimit";

export default function createUserRouter(
    userController: UserController,
): Router {
    const router = express.Router();

    router.post(
        "/register",
        registerIpLimiter,
        registerLimiter,
        userController.registerUser,
    );
    router.post(
        "/login",
        loginIpLimiter,
        loginLimiter,
        userController.loginUser,
    );
    router.post("/logout", userController.logout);
    router.get("/me", authenticateToken, userController.me);
    router.post(
        "/forgot-password",
        forgotPasswordLimiter,
        userController.requestPasswordReset,
    );
    router.post(
        "/reset-password",
        resetPasswordLimiter,
        userController.confirmPasswordReset,
    );
    router.post(
        "/change-password",
        authenticateToken,
        changePasswordLimiter,
        userController.changePassword,
    );
    router.patch("/me", authenticateToken, userController.updateProfile);
    router.delete(
        "/me",
        authenticateToken,
        deleteAccountLimiter,
        userController.deleteAccount,
    );
    router.post(
        "/resend-verification-email",
        authenticateToken,
        resendVerificationLimiter,
        userController.requestEmailVerification,
    );
    router.post(
        "/confirm-email",
        confirmEmailLimiter,
        userController.confirmEmailVerification,
    );

    return router;
}
