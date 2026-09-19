import type { RequestHandler } from "express";

import type CreateTag from "application/use-cases/tags/CreateTag";
import type DeleteTag from "application/use-cases/tags/DeleteTag";
import type GetTags from "application/use-cases/tags/GetTags";
import type RenameTag from "application/use-cases/tags/RenameTag";
import type SetRecipeTags from "application/use-cases/tags/SetRecipeTags";

import { getUserId } from "./requestUser";

interface TagControllerDependencies {
    getTags: GetTags;
    createTag: CreateTag;
    renameTag: RenameTag;
    deleteTag: DeleteTag;
    setRecipeTags: SetRecipeTags;
}

export default class TagController {
    private getTagsUseCase: GetTags;
    private createTagUseCase: CreateTag;
    private renameTagUseCase: RenameTag;
    private deleteTagUseCase: DeleteTag;
    private setRecipeTagsUseCase: SetRecipeTags;

    constructor({
        getTags,
        createTag,
        renameTag,
        deleteTag,
        setRecipeTags,
    }: TagControllerDependencies) {
        this.getTagsUseCase = getTags;
        this.createTagUseCase = createTag;
        this.renameTagUseCase = renameTag;
        this.deleteTagUseCase = deleteTag;
        this.setRecipeTagsUseCase = setRecipeTags;
    }

    getTags: RequestHandler = async (req, res) => {
        const tags = await this.getTagsUseCase.execute(getUserId(req));

        res.status(200).json(tags);
    };

    createTag: RequestHandler = async (req, res) => {
        const tag = await this.createTagUseCase.execute(
            getUserId(req),
            req.body,
        );

        res.status(201).json(tag);
    };

    renameTag: RequestHandler<{ id: string }> = async (req, res) => {
        await this.renameTagUseCase.execute(
            getUserId(req),
            req.params.id,
            req.body,
        );

        res.status(204).end();
    };

    deleteTag: RequestHandler<{ id: string }> = async (req, res) => {
        await this.deleteTagUseCase.execute(getUserId(req), req.params.id);

        res.status(204).end();
    };

    setRecipeTags: RequestHandler<{ id: string }> = async (req, res) => {
        await this.setRecipeTagsUseCase.execute(
            getUserId(req),
            req.params.id,
            req.body,
        );

        res.status(204).end();
    };
}
