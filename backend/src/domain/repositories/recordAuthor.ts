export interface RecordRating {
    ratingAverage: number | null;
    ratingCount: number;
    myRating: number | null;
}

// never the login (half a credential) or the email
export interface RecordAuthor {
    name: string;
    surname_initial: string;
    avatar: string | null;
    avatar_photo_key: string | null;
}
