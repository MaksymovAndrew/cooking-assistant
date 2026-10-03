import type { RequestHandler } from "express";

import { requestLocale } from "i18n/requestLocale";
import { translateMessage } from "i18n/translate";

import type CreateMenu from "application/use-cases/menus/CreateMenu";
import type DeleteMenu from "application/use-cases/menus/DeleteMenu";
import type GetAllMenus from "application/use-cases/menus/GetAllMenus";
import type GetMenuById from "application/use-cases/menus/GetMenuById";
import type GetMenuStats from "application/use-cases/menus/GetMenuStats";
import type SearchPersonMenus from "application/use-cases/menus/SearchPersonMenus";
import type UpdateMenu from "application/use-cases/menus/UpdateMenu";

import { requestBody } from "./requestBody";
import { getOptionalUserId, getUserId } from "./requestUser";

interface MenuControllerDependencies {
    getAllMenus: GetAllMenus;
    createMenu: CreateMenu;
    getMenuById: GetMenuById;
    updateMenu: UpdateMenu;
    deleteMenu: DeleteMenu;
    searchPersonMenus: SearchPersonMenus;
    getMenuStats: GetMenuStats;
}

export default class MenuController {
    private getAllMenusUseCase: GetAllMenus;
    private createMenuUseCase: CreateMenu;
    private getMenuByIdUseCase: GetMenuById;
    private updateMenuUseCase: UpdateMenu;
    private deleteMenuUseCase: DeleteMenu;
    private searchPersonMenusUseCase: SearchPersonMenus;
    private getMenuStatsUseCase: GetMenuStats;

    constructor({
        getAllMenus,
        createMenu,
        getMenuById,
        updateMenu,
        deleteMenu,
        searchPersonMenus,
        getMenuStats,
    }: MenuControllerDependencies) {
        this.getAllMenusUseCase = getAllMenus;
        this.createMenuUseCase = createMenu;
        this.getMenuByIdUseCase = getMenuById;
        this.updateMenuUseCase = updateMenu;
        this.deleteMenuUseCase = deleteMenu;
        this.searchPersonMenusUseCase = searchPersonMenus;
        this.getMenuStatsUseCase = getMenuStats;
    }

    getAll: RequestHandler = async (req, res) => {
        const menus = await this.getAllMenusUseCase.execute(
            getOptionalUserId(req),
            req.query,
        );

        res.status(200).json(menus);
    };

    getStats: RequestHandler = async (_req, res) => {
        const stats = await this.getMenuStatsUseCase.execute();

        res.status(200).json(stats);
    };

    create: RequestHandler = async (req, res) => {
        const menuId = await this.createMenuUseCase.execute({
            ...requestBody(req),
            personId: getUserId(req),
        });

        res.status(201).json({
            message: translateMessage("menuCreated", requestLocale(req)),
            menuId,
        });
    };

    getById: RequestHandler<{ id: string }> = async (req, res) => {
        const menu = await this.getMenuByIdUseCase.execute(
            req.params.id,
            getOptionalUserId(req),
        );

        res.status(200).json(menu);
    };

    update: RequestHandler<{ id: string }> = async (req, res) => {
        await this.updateMenuUseCase.execute(
            req.params.id,
            getUserId(req),
            req.body,
        );

        res.status(200).json({
            message: translateMessage("menuUpdated", requestLocale(req)),
        });
    };

    remove: RequestHandler<{ id: string }> = async (req, res) => {
        await this.deleteMenuUseCase.execute(req.params.id, getUserId(req));

        res.status(200).json({
            message: translateMessage("menuDeleted", requestLocale(req)),
        });
    };

    searchByPerson: RequestHandler = async (req, res) => {
        const id = getUserId(req);
        const menus = await this.searchPersonMenusUseCase.execute(
            id,
            req.query,
        );

        res.status(200).json(menus);
    };
}
