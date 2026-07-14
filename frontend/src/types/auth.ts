export interface LoginRequest {
    login: string;
    password: string;
}

export interface CurrentUser {
    id: number;
    name: string;
    surname: string;
    login: string;
    created_at: string;
    email: string;
    email_verified_at: string | null;
}

export interface RegisterRequest {
    name: string;
    surname: string;
    login: string;
    email: string;
    password: string;
}

export interface RegisterErrors {
    name?: string;
    surname?: string;
    login?: string;
    email?: string;
    password?: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface ConfirmEmailRequest {
    token: string;
}
