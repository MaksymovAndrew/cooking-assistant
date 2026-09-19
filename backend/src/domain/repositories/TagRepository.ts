export interface Tag {
    id: number;
    name: string;
}

// person_not_found: a session still valid for an account deleted since it was issued
export type CreateTagResult =
    | { outcome: "created"; tag: Tag }
    | { outcome: "duplicate_name"; tag: null }
    | { outcome: "limit_reached"; tag: null }
    | { outcome: "person_not_found"; tag: null };

export type RenameTagOutcome = "renamed" | "duplicate_name" | "not_found";

export type SetRecipeTagsOutcome =
    "saved" | "recipe_not_found" | "tags_not_found";

export interface TagRepository {
    findByPerson(personId: number): Promise<Tag[]>;
    create(
        personId: number,
        name: string,
        maxTags: number,
    ): Promise<CreateTagResult>;
    rename(
        personId: number,
        tagId: number,
        name: string,
    ): Promise<RenameTagOutcome>;
    delete(personId: number, tagId: number): Promise<boolean>;
    // replaces the person's whole tag set on one recipe; tag ids must all be theirs
    setRecipeTags(
        personId: number,
        recipeId: number,
        tagIds: number[],
    ): Promise<SetRecipeTagsOutcome>;
}
