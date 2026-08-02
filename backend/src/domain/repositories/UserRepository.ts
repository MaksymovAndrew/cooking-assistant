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
    email: string;
}

// the safe, public-facing shape of a person row - no password. email is always set (required at
// registration, NOT NULL in the DB); email_verified_at stays nullable - that's the real unverified state
export interface PublicUser {
    id: number;
    name: string;
    surname: string;
    login: string;
    created_at: string;
    email: string;
    email_verified_at: string | null;
    avatar: string | null;
    calorie_goal: number | null;
    meal_calorie_limit: number | null;
}

// the editable profile fields; avatar is a preset key or null (no avatar - fall back to initials)
export interface ProfileUpdate {
    name: string;
    surname: string;
    avatar: string | null;
}

// just enough to check/update a password without ever exposing it through GetCurrentUser/`/me`
export interface UserCredentials {
    id: number;
    password: string;
}

// just enough for RequestPasswordReset to decide silently-noop vs proceed, and to bind the
// reset token to the current password hash, in a single query
export interface PasswordResetCandidate {
    id: number;
    password: string;
    email_verified_at: string | null;
}

export interface UserRepository {
    findByLogin(login: string): Promise<UserRecord | null>;
    findById(id: number): Promise<PublicUser | null>;
    findByEmail(email: string): Promise<PublicUser | null>;
    findCredentialsById(id: number): Promise<UserCredentials | null>;
    findCredentialsByEmail(email: string): Promise<UserCredentials | null>;
    findPasswordResetCandidateByEmail(
        email: string,
    ): Promise<PasswordResetCandidate | null>;
    create(user: NewUser): Promise<{ id: number }>;
    updatePassword(id: number, hashedPassword: string): Promise<void>;
    updateProfile(id: number, data: ProfileUpdate): Promise<void>;
    markEmailVerified(id: number): Promise<void>;
    delete(id: number): Promise<void>;
}
