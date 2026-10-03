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

export interface ProfileUpdate {
    name: string;
    surname: string;
    avatar: string | null;
}

// kept apart from PublicUser so a password can never leak through /me
export interface UserCredentials {
    id: number;
    password: string;
    session_version: number;
}

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
    // raises the session version too, ending every older session; null once the account is gone
    updatePassword(id: number, hashedPassword: string): Promise<number | null>;
    // raises the session version alone, ending every session so far; null once the account is gone
    revokeSessions(id: number): Promise<number | null>;
    // what a session token must carry to still be valid; null once the account is gone
    findSessionVersion(id: number): Promise<number | null>;
    updateProfile(id: number, data: ProfileUpdate): Promise<void>;
    updateLocale(id: number, locale: Locale): Promise<void>;
    markEmailVerified(id: number): Promise<void>;
    // the photo keys the account held, for removing the files once it is gone
    delete(id: number): Promise<string[]>;
}
