import type { UserRepository } from "domain/repositories/UserRepository";

import type { EmailSender } from "application/ports/EmailSender";
import type { PasswordHasher } from "application/ports/PasswordHasher";
import type { TokenService } from "application/ports/TokenService";
import ChangePassword from "application/use-cases/users/ChangePassword";
import ConfirmEmailVerification from "application/use-cases/users/ConfirmEmailVerification";
import ConfirmPasswordReset from "application/use-cases/users/ConfirmPasswordReset";
import DeleteAccount from "application/use-cases/users/DeleteAccount";
import GetCurrentUser from "application/use-cases/users/GetCurrentUser";
import LoginUser from "application/use-cases/users/LoginUser";
import RegisterUser from "application/use-cases/users/RegisterUser";
import RequestEmailVerification from "application/use-cases/users/RequestEmailVerification";
import RequestPasswordReset from "application/use-cases/users/RequestPasswordReset";
import UpdateProfile from "application/use-cases/users/UpdateProfile";

import UserController from "controller/user.controller";
import UserSecurityController from "controller/userSecurity.controller";

// split out of composition-root.ts, which hit the file's line-count lint cap once this was inlined
export interface UserControllers {
    userController: UserController;
    userSecurityController: UserSecurityController;
}

export interface UserControllerDeps {
    userRepository: UserRepository;
    passwordHasher: PasswordHasher;
    tokenService: TokenService;
    emailSender: EmailSender;
    frontendOrigin: string;
}

export function buildUserControllers({
    userRepository,
    passwordHasher,
    tokenService,
    emailSender,
    frontendOrigin,
}: UserControllerDeps): UserControllers {
    const userController = new UserController({
        registerUser: new RegisterUser(
            userRepository,
            passwordHasher,
            tokenService,
        ),
        loginUser: new LoginUser(userRepository, passwordHasher, tokenService),
        getCurrentUser: new GetCurrentUser(userRepository),
        updateProfile: new UpdateProfile(userRepository),
        deleteAccount: new DeleteAccount(userRepository, passwordHasher),
    });

    const userSecurityController = new UserSecurityController({
        requestPasswordReset: new RequestPasswordReset(
            userRepository,
            tokenService,
            emailSender,
            frontendOrigin,
        ),
        confirmPasswordReset: new ConfirmPasswordReset(
            userRepository,
            passwordHasher,
            tokenService,
        ),
        changePassword: new ChangePassword(userRepository, passwordHasher),
        requestEmailVerification: new RequestEmailVerification(
            userRepository,
            tokenService,
            emailSender,
            frontendOrigin,
        ),
        confirmEmailVerification: new ConfirmEmailVerification(
            userRepository,
            tokenService,
        ),
    });

    return { userController, userSecurityController };
}
