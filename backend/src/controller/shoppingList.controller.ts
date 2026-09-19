import type { RequestHandler } from "express";

import type AddIngredientsToShoppingList from "application/use-cases/shopping-list/AddIngredientsToShoppingList";
import type AddShoppingListItem from "application/use-cases/shopping-list/AddShoppingListItem";
import type ClearCheckedShoppingListItems from "application/use-cases/shopping-list/ClearCheckedShoppingListItems";
import type DeleteShoppingListItem from "application/use-cases/shopping-list/DeleteShoppingListItem";
import type GetShoppingList from "application/use-cases/shopping-list/GetShoppingList";
import type ReorderShoppingList from "application/use-cases/shopping-list/ReorderShoppingList";
import type UpdateShoppingListItem from "application/use-cases/shopping-list/UpdateShoppingListItem";

import { getUserId } from "./requestUser";

interface ShoppingListControllerDependencies {
    getShoppingList: GetShoppingList;
    addShoppingListItem: AddShoppingListItem;
    updateShoppingListItem: UpdateShoppingListItem;
    deleteShoppingListItem: DeleteShoppingListItem;
    clearCheckedShoppingListItems: ClearCheckedShoppingListItems;
    reorderShoppingList: ReorderShoppingList;
    addIngredientsToShoppingList: AddIngredientsToShoppingList;
}

export default class ShoppingListController {
    private getShoppingListUseCase: GetShoppingList;
    private addShoppingListItemUseCase: AddShoppingListItem;
    private updateShoppingListItemUseCase: UpdateShoppingListItem;
    private deleteShoppingListItemUseCase: DeleteShoppingListItem;
    private clearCheckedShoppingListItemsUseCase: ClearCheckedShoppingListItems;
    private reorderShoppingListUseCase: ReorderShoppingList;
    private addIngredientsToShoppingListUseCase: AddIngredientsToShoppingList;

    constructor({
        getShoppingList,
        addShoppingListItem,
        updateShoppingListItem,
        deleteShoppingListItem,
        clearCheckedShoppingListItems,
        reorderShoppingList,
        addIngredientsToShoppingList,
    }: ShoppingListControllerDependencies) {
        this.getShoppingListUseCase = getShoppingList;
        this.addShoppingListItemUseCase = addShoppingListItem;
        this.updateShoppingListItemUseCase = updateShoppingListItem;
        this.deleteShoppingListItemUseCase = deleteShoppingListItem;
        this.clearCheckedShoppingListItemsUseCase =
            clearCheckedShoppingListItems;
        this.reorderShoppingListUseCase = reorderShoppingList;
        this.addIngredientsToShoppingListUseCase = addIngredientsToShoppingList;
    }

    getShoppingList: RequestHandler = async (req, res) => {
        const items = await this.getShoppingListUseCase.execute(getUserId(req));

        res.status(200).json(items);
    };

    addShoppingListItem: RequestHandler = async (req, res) => {
        const item = await this.addShoppingListItemUseCase.execute(
            getUserId(req),
            req.body,
        );

        res.status(201).json(item);
    };

    updateShoppingListItem: RequestHandler<{ id: string }> = async (
        req,
        res,
    ) => {
        const item = await this.updateShoppingListItemUseCase.execute(
            getUserId(req),
            req.params.id,
            req.body,
        );

        res.status(200).json(item);
    };

    deleteShoppingListItem: RequestHandler<{ id: string }> = async (
        req,
        res,
    ) => {
        await this.deleteShoppingListItemUseCase.execute(
            getUserId(req),
            req.params.id,
        );

        res.status(204).end();
    };

    clearCheckedShoppingListItems: RequestHandler = async (req, res) => {
        await this.clearCheckedShoppingListItemsUseCase.execute(getUserId(req));

        res.status(204).end();
    };

    reorderShoppingList: RequestHandler = async (req, res) => {
        await this.reorderShoppingListUseCase.execute(getUserId(req), req.body);

        res.status(204).end();
    };

    addIngredientsToShoppingList: RequestHandler = async (req, res) => {
        await this.addIngredientsToShoppingListUseCase.execute(
            getUserId(req),
            req.body,
        );

        res.status(204).end();
    };
}
