import type { PhotoTarget } from "domain/repositories/PhotoRepository";

interface PhotoTable {
    table: string;
    idColumn: string;
    ownerColumn: string;
    keyColumn: string;
}

// fixed identifiers, never request input - the only thing photo SQL interpolates
export const PHOTO_TABLES = {
    recipe: {
        table: "recipes",
        idColumn: "id",
        ownerColumn: "person_id",
        keyColumn: "photo_key",
    },
    menu: {
        table: "menu",
        idColumn: "menu_id",
        ownerColumn: "person_id",
        keyColumn: "photo_key",
    },
    // an account is its own owner
    avatar: {
        table: "person",
        idColumn: "id",
        ownerColumn: "id",
        keyColumn: "avatar_photo_key",
    },
} satisfies Record<PhotoTarget, PhotoTable>;
