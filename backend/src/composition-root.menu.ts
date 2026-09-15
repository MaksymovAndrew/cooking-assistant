import type { MenuRepository } from "domain/repositories/MenuRepository";
import type { RecipeRepository } from "domain/repositories/RecipeRepository";

import CreateMenu from "application/use-cases/menus/CreateMenu";
import DeleteMenu from "application/use-cases/menus/DeleteMenu";
import GetAllMenus from "application/use-cases/menus/GetAllMenus";
import GetAllMenusUnpaginated from "application/use-cases/menus/GetAllMenusUnpaginated";
import GetMenuById from "application/use-cases/menus/GetMenuById";
import SearchPersonMenus from "application/use-cases/menus/SearchPersonMenus";
import UpdateMenu from "application/use-cases/menus/UpdateMenu";

import MenuController from "controller/menu.controller";

interface MenuControllerDependencies {
    menuRepository: MenuRepository;
    recipeRepository: RecipeRepository;
}

export function buildMenuController({
    menuRepository,
    recipeRepository,
}: MenuControllerDependencies): MenuController {
    return new MenuController({
        getAllMenus: new GetAllMenus(menuRepository),
        getAllMenusUnpaginated: new GetAllMenusUnpaginated(menuRepository),
        createMenu: new CreateMenu(menuRepository, recipeRepository),
        getMenuById: new GetMenuById(menuRepository),
        updateMenu: new UpdateMenu(menuRepository, recipeRepository),
        deleteMenu: new DeleteMenu(menuRepository),
        searchPersonMenus: new SearchPersonMenus(menuRepository),
    });
}
