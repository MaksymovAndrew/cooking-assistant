// the public face of whoever owns a recipe or menu - never the login (half a credential) or the email
export interface RecordAuthor {
    name: string;
    surname_initial: string;
    avatar: string | null;
    avatar_photo_key: string | null;
}
