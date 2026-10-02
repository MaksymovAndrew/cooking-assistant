import type { Pool } from "pg";

import type { Locale } from "constants/locales";
import type {
    NewUser,
    PasswordResetCandidate,
    ProfileUpdate,
    PublicUser,
    UserCredentials,
    UserRecord,
    UserRepository,
} from "domain/repositories/UserRepository";

import { firstRow } from "./firstRow";
import { createUser } from "./PgUserRepository.create";
import { deleteUser } from "./PgUserRepository.delete";
import {
    markEmailVerified,
    updateLocale,
    updateProfile,
} from "./PgUserRepository.profile";
import {
    findSessionVersion,
    revokeSessions,
    updatePassword,
} from "./PgUserRepository.sessions";

const PUBLIC_USER_COLUMNS =
    "id, name, surname, login, created_at, email, email_verified_at, avatar, " +
    "avatar_photo_key, calorie_goal, locale";

export default class PgUserRepository implements UserRepository {
    constructor(private pool: Pool) {}

    async findByLogin(login: string): Promise<UserRecord | null> {
        return firstRow<UserRecord>(
            this.pool,
            `SELECT * FROM person WHERE login = $1`,
            [login],
        );
    }

    async findById(id: number): Promise<PublicUser | null> {
        return firstRow<PublicUser>(
            this.pool,
            `SELECT ${PUBLIC_USER_COLUMNS} FROM person WHERE id = $1`,
            [id],
        );
    }

    async findByEmail(email: string): Promise<PublicUser | null> {
        return firstRow<PublicUser>(
            this.pool,
            `SELECT ${PUBLIC_USER_COLUMNS} FROM person WHERE email = $1`,
            [email],
        );
    }

    async findCredentialsById(id: number): Promise<UserCredentials | null> {
        return firstRow<UserCredentials>(
            this.pool,
            `SELECT id, password, session_version FROM person WHERE id = $1`,
            [id],
        );
    }

    async findCredentialsByEmail(
        email: string,
    ): Promise<UserCredentials | null> {
        return firstRow<UserCredentials>(
            this.pool,
            `SELECT id, password, session_version FROM person WHERE email = $1`,
            [email],
        );
    }

    async findPasswordResetCandidateByEmail(
        email: string,
    ): Promise<PasswordResetCandidate | null> {
        return firstRow<PasswordResetCandidate>(
            this.pool,
            `SELECT id, password, email_verified_at, locale FROM person WHERE email = $1`,
            [email],
        );
    }

    create(newUser: NewUser): Promise<{ id: number; session_version: number }> {
        return createUser(this.pool, newUser);
    }

    updatePassword(id: number, hashedPassword: string): Promise<number | null> {
        return updatePassword(this.pool, id, hashedPassword);
    }

    revokeSessions(id: number): Promise<number | null> {
        return revokeSessions(this.pool, id);
    }

    findSessionVersion(id: number): Promise<number | null> {
        return findSessionVersion(this.pool, id);
    }

    updateProfile(id: number, profile: ProfileUpdate): Promise<void> {
        return updateProfile(this.pool, id, profile);
    }

    updateLocale(id: number, locale: Locale): Promise<void> {
        return updateLocale(this.pool, id, locale);
    }

    markEmailVerified(id: number): Promise<void> {
        return markEmailVerified(this.pool, id);
    }

    async delete(id: number): Promise<string[]> {
        return deleteUser(this.pool, id);
    }
}
