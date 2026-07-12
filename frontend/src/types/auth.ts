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
}

export interface RegisterRequest {
    name: string;
    surname: string;
    login: string;
    password: string;
}

export interface RegisterErrors {
    name?: string;
    surname?: string;
    login?: string;
    password?: string;
}
