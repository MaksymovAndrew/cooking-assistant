import request from "supertest";

import {
    ERROR_CODES,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
} from "constants/errorMessages";

import { authCookie, buildTestApp } from "test/helpers/testApp";

const MENU_TITLE = "Weekly menu";
const MENU_9_PATH = "/api/menu/9";

function makeMenuBody() {
    return {
        menuTitle: MENU_TITLE,
        menuContent: "Simple dinners",
        categoryId: 2,
        recipeIds: [3, 5],
    };
}

describe("menu routes", () => {
    it("should return 401 without a token", async () => {
        const { app } = buildTestApp();

        const res = await request(app).get("/api/menu");

        expect(res.status).toBe(401);
    });

    it("should return menus", async () => {
        const { app, deps } = buildTestApp();
        const paginated = {
            items: [{ id: 9, title: MENU_TITLE }],
            total: 1,
        };

        deps.menuRepository.findAll.mockResolvedValue(paginated);

        const res = await request(app)
            .get("/api/menu?menu_name=Weekly")
            .set("Cookie", authCookie());

        expect(res.status).toBe(200);
        expect(res.body).toEqual(paginated);
    });

    it("should pass limit and offset through to the repository", async () => {
        const { app, deps } = buildTestApp();

        deps.menuRepository.findAll.mockResolvedValue({ items: [], total: 0 });

        const res = await request(app)
            .get("/api/menu?limit=10&offset=20")
            .set("Cookie", authCookie());

        expect(res.status).toBe(200);
        expect(deps.menuRepository.findAll).toHaveBeenCalledWith({
            limit: 10,
            offset: 20,
        });
    });

    it("should return a 400 error body for an out-of-range limit", async () => {
        const { app, deps } = buildTestApp();

        const res = await request(app)
            .get("/api/menu?limit=101")
            .set("Cookie", authCookie());

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            error: "limit: Limit must be at most 100",
            code: ERROR_CODES.VALIDATION_ERROR,
        });
        expect(deps.menuRepository.findAll).not.toHaveBeenCalled();
    });

    it("should return every menu unpaginated", async () => {
        const { app, deps } = buildTestApp();
        const menus = [
            { id: 9, title: MENU_TITLE },
            { id: 10, title: "Holiday menu" },
        ];

        deps.menuRepository.findAllUnpaginated.mockResolvedValue(menus);

        const res = await request(app)
            .get("/api/menus")
            .set("Cookie", authCookie());

        expect(res.status).toBe(200);
        expect(res.body).toEqual(menus);
    });

    it("should create a menu, including public recipes of other users", async () => {
        const { app, deps } = buildTestApp();

        deps.recipeRepository.findExistingIds.mockResolvedValue([3, 5]);
        deps.menuRepository.create.mockResolvedValue(9);

        const res = await request(app)
            .post("/api/create-menu")
            .set("Cookie", authCookie(7))
            .send(makeMenuBody());

        expect(res.status).toBe(201);
        expect(res.body).toEqual({
            message: SUCCESS_MESSAGES.MENU_CREATED,
            menuId: 9,
        });
        expect(deps.menuRepository.create.mock.calls[0][0]).toMatchObject({
            menuTitle: MENU_TITLE,
            personId: 7,
        });
        expect(deps.recipeRepository.findExistingIds).toHaveBeenCalledWith([
            3, 5,
        ]);
    });

    it("should return 400 when creating a menu with a recipe that does not exist", async () => {
        const { app, deps } = buildTestApp();

        deps.recipeRepository.findExistingIds.mockResolvedValue([3]);

        const res = await request(app)
            .post("/api/create-menu")
            .set("Cookie", authCookie(7))
            .send(makeMenuBody());

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            error: ERROR_MESSAGES.MENU_RECIPES_NOT_EXIST,
        });
        expect(deps.menuRepository.create).not.toHaveBeenCalled();
    });

    it("should return menu details scoped to the authenticated user", async () => {
        const { app, deps } = buildTestApp();
        const menu = {
            menu: { id: 9, isOwner: true },
            recipes: [],
            allergens: [],
        };

        deps.menuRepository.findByIdWithRecipes.mockResolvedValue(menu);

        const res = await request(app)
            .get(MENU_9_PATH)
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(200);
        expect(res.body).toEqual(menu);
        expect((res.body as { menu: { isOwner: boolean } }).menu.isOwner).toBe(
            true,
        );
        expect(deps.menuRepository.findByIdWithRecipes).toHaveBeenCalledWith(
            9,
            7,
        );
    });

    it("should return menu details with isOwner:false when reading a menu of another user", async () => {
        const { app, deps } = buildTestApp();
        const menu = {
            menu: { id: 9, isOwner: false },
            recipes: [],
            allergens: [],
        };

        deps.menuRepository.findByIdWithRecipes.mockResolvedValue(menu);

        const res = await request(app)
            .get(MENU_9_PATH)
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(200);
        expect((res.body as { menu: { isOwner: boolean } }).menu.isOwner).toBe(
            false,
        );
        expect(deps.menuRepository.findByIdWithRecipes).toHaveBeenCalledWith(
            9,
            7,
        );
    });

    it("should update a menu owned by the authenticated user", async () => {
        const { app, deps } = buildTestApp();

        deps.recipeRepository.findExistingIds.mockResolvedValue([3, 5]);
        deps.menuRepository.update.mockResolvedValue(true);

        const res = await request(app)
            .put(MENU_9_PATH)
            .set("Cookie", authCookie(7))
            .send(makeMenuBody());

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: SUCCESS_MESSAGES.MENU_UPDATED });
        expect(deps.menuRepository.update.mock.calls[0][0]).toBe(9);
        expect(deps.menuRepository.update.mock.calls[0][1]).toBe(7);
    });

    it("should return 404 when updating a menu of another user", async () => {
        const { app, deps } = buildTestApp();

        deps.recipeRepository.findExistingIds.mockResolvedValue([3, 5]);
        deps.menuRepository.update.mockResolvedValue(false);

        const res = await request(app)
            .put(MENU_9_PATH)
            .set("Cookie", authCookie(7))
            .send(makeMenuBody());

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: ERROR_MESSAGES.MENU_NOT_FOUND });
    });

    it("should delete a menu owned by the authenticated user", async () => {
        const { app, deps } = buildTestApp();

        deps.menuRepository.deleteById.mockResolvedValue(true);

        const res = await request(app)
            .delete(MENU_9_PATH)
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: SUCCESS_MESSAGES.MENU_DELETED });
        expect(deps.menuRepository.deleteById).toHaveBeenCalledWith(9, 7);
    });

    it("should search person menus by the authenticated user", async () => {
        const { app, deps } = buildTestApp();
        const paginated = {
            items: [{ id: 9, title: MENU_TITLE }],
            total: 1,
        };

        deps.menuRepository.searchByPerson.mockResolvedValue(paginated);

        const res = await request(app)
            .get("/api/menu-filters-person?menu_name=Weekly")
            .set("Cookie", authCookie(7));

        expect(res.status).toBe(200);
        expect(res.body).toEqual(paginated);
        expect(deps.menuRepository.searchByPerson).toHaveBeenCalledWith(7, {
            menu_name: "Weekly",
        });
    });

    it("should map a missing menu to an error response", async () => {
        const { app, deps } = buildTestApp();

        deps.menuRepository.findByIdWithRecipes.mockResolvedValue(null);

        const res = await request(app)
            .get("/api/menu/99")
            .set("Cookie", authCookie());

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: ERROR_MESSAGES.MENU_NOT_FOUND });
    });
});
