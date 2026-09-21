// the public face of whoever owns a recipe or menu: never their login or email
export interface RecordAuthor {
    name: string;
    surname_initial: string;
    // a preset avatar key and an uploaded photo are kept apart; the photo wins when both are set
    avatar: string | null;
    avatar_photo_key: string | null;
}

// records that carry a photo of their own; the avatar is the account's and has no id to pass
export type RecordPhotoTarget = "recipe" | "menu";

export interface PhotoUploadResponse {
    photo_key: string;
}
