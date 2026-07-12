export interface UserRecord {
    id: number;
    password: string;
    [key: string]: unknown;
}

export interface NewUser {
    name: string;
    surname: string;
    login: string;
    password: string;
}

// the safe, public-facing shape of a person row - no password
export interface PublicUser {
    id: number;
    name: string;
    surname: string;
    login: string;
    created_at: string;
}

export interface UserRepository {
    findByLogin(login: string): Promise<UserRecord | null>;
    findById(id: number): Promise<PublicUser | null>;
    create(user: NewUser): Promise<unknown>;
    findAll(): Promise<unknown[]>;
}
