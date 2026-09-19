import type { TagRepository } from "domain/repositories/TagRepository";

import CreateTag from "application/use-cases/tags/CreateTag";
import DeleteTag from "application/use-cases/tags/DeleteTag";
import GetTags from "application/use-cases/tags/GetTags";
import RenameTag from "application/use-cases/tags/RenameTag";
import SetRecipeTags from "application/use-cases/tags/SetRecipeTags";

import TagController from "controller/tag.controller";

export interface TagControllers {
    tagController: TagController;
}

export function buildTagControllers(
    tagRepository: TagRepository,
): TagControllers {
    const tagController = new TagController({
        getTags: new GetTags(tagRepository),
        createTag: new CreateTag(tagRepository),
        renameTag: new RenameTag(tagRepository),
        deleteTag: new DeleteTag(tagRepository),
        setRecipeTags: new SetRecipeTags(tagRepository),
    });

    return { tagController };
}
