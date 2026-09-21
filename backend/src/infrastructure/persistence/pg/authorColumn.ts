// the owner's first name, surname initial and avatar only; person_id itself still never leaves the server
export function authorColumn(tableAlias: string): string {
    return `(
        SELECT json_build_object(
            'name', p.name,
            'surname_initial', left(p.surname, 1),
            'avatar', p.avatar,
            'avatar_photo_key', p.avatar_photo_key
        )
        FROM person p WHERE p.id = ${tableAlias}.person_id
    ) AS author`;
}
