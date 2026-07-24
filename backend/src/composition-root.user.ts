import type { UserRepository } from "domain/repositories/UserRepository";

import type { EmailSender } from "application/ports/EmailSender";
import type { PasswordHasher } from "application/ports/PasswordHasher";
import type { TokenService } from "application/ports/TokenService";
import ChangePassword from "application/use-cases/users/ChangePassword";
import ConfirmEmailVerification from "application/use-cases/users/ConfirmEmailVerification";
import ConfirmPasswordReset from "application/use-cases/users/ConfirmPasswordReset";
import DeleteAccount from "application/use-cases/users/DeleteAccount";
import GetCurrentUser from "application/use-cases/users/GetCurrentUser";
import GetUsers from "application/use-cases/users/GetUsers";
import LoginUser from "application/use-cases/users/LoginUser";
import RegisterUser from "application/use-cases/users/RegisterUser";
import RequestEmailVerification from "application/use-cases/users/RequestEmailVerification";
import RequestPasswordReset from "application/use-cases/users/RequestPasswordReset";
import UpdateProfile from "application/use-cases/users/UpdateProfile";

import UserController from "controller/user.controller";

// split out of composition-root.ts, which hit the file's line-count lint cap once this was inlined
export interface UserControllerDeps {
    userRepository: UserRepository;
    passwordHasher: PasswordHasher;
    tokenService: TokenService;
    emailSender: EmailSender;
    frontendOrigin: string;
}

export function buildUserController({
    userRepository,
    passwordHasher,
    tokenService,
    emailSender,
    frontendOrigin,
}: UserControllerDeps): UserController {
    return new UserController({
        registerUser: new RegisterUser(
            userRepository,
            passwordHasher,
            tokenService,
        ),
        loginUser: new LoginUser(userRepository, passwordHasher, tokenService),
        getUsers: new GetUsers(userRepository),
        getCurrentUser: new GetCurrentUser(userRepository),
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
        updateProfile: new UpdateProfile(userRepository),
        deleteAccount: new DeleteAccount(userRepository, passwordHasher),
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
}
