import type { Locale } from "constants/locales";

export interface UserRecord {
    id: number;
    password: string;
    session_version: number;
    [key: string]: unknown;
}

export interface NewUser {
    name: string;
    surname: string;
    login: string;
    password: string;
    email: string;
    locale: Locale;
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
    avatar_photo_key: string | null;
    calorie_goal: number | null;
    locale: Locale;
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
    session_version: number;
}

// just enough for RequestPasswordReset to decide silently-noop vs proceed, to bind the
// reset token to the current password hash, and to write in the account's language, in a single query
export interface PasswordResetCandidate {
    id: number;
    password: string;
    email_verified_at: string | null;
    locale: Locale;
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
    create(user: NewUser): Promise<{ id: number; session_version: number }>;
    // raises the session version too, ending every session issued under the old password; null
    // when the account is gone
    updatePassword(id: number, hashedPassword: string): Promise<number | null>;
    // what a session token must carry to still be valid; null once the account is gone
    findSessionVersion(id: number): Promise<number | null>;
    updateProfile(id: number, data: ProfileUpdate): Promise<void>;
    updateLocale(id: number, locale: Locale): Promise<void>;
    markEmailVerified(id: number): Promise<void>;
    // the photo keys the account held, for removing the files once it is gone
    delete(id: number): Promise<string[]>;
}
