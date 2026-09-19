import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Tag } from "types/tag";

import { API_ROUTES } from "api/endpoints";

import { RecipeTagsPanel } from "components/recipes/RecipeTagsPanel";

import {
    makeAxiosError,
    mockedPost,
    mockedPut,
    mockGetByUrl,
} from "test/apiClientMock";
import { renderWithRouter } from "test/router";

jest.mock("api/client");

const RECIPE_ID = 4;
const QUICK: Tag = { id: 1, name: "Quick" };
const SLOW: Tag = { id: 2, name: "Slow" };
const ARIA_CHECKED = "aria-checked";
const EDIT_LABEL = "Edit tags";

const setup = (tags: Tag[] = [], catalog: Tag[] = [QUICK, SLOW]) => {
    mockGetByUrl({ [API_ROUTES.tags.list]: catalog });

    return renderWithRouter(
        <RecipeTagsPanel recipeId={RECIPE_ID} tags={tags} />,
    );
};

const setupUser = () => userEvent.setup();

const openEditor = async (user: ReturnType<typeof setupUser>) => {
    await user.click(await screen.findByRole("button", { name: EDIT_LABEL }));
};

describe("RecipeTagsPanel", () => {
    it("should list the tags already on the recipe", async () => {
        setup([QUICK]);

        expect(await screen.findByText(QUICK.name)).toBeInTheDocument();
        expect(
            screen.queryByText("No tags on this recipe yet."),
        ).not.toBeInTheDocument();
    });

    it("should tell the viewer when the recipe has no tags", async () => {
        setup();

        expect(
            await screen.findByText("No tags on this recipe yet."),
        ).toBeInTheDocument();
    });

    it("should attach a tag on the spot and save it", async () => {
        setup();
        mockedPut.mockResolvedValue({ data: null });

        const user = setupUser();

        await openEditor(user);

        await user.click(screen.getByRole("checkbox", { name: SLOW.name }));

        expect(
            await screen.findByRole("checkbox", { name: SLOW.name }),
        ).toHaveAttribute(ARIA_CHECKED, "true");
        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.recipes.tags(RECIPE_ID),
            { tag_ids: [SLOW.id] },
        );
    });

    it("should detach a tag the recipe already had", async () => {
        setup([QUICK]);
        mockedPut.mockResolvedValue({ data: null });

        const user = setupUser();

        await openEditor(user);

        await user.click(screen.getByRole("checkbox", { name: QUICK.name }));

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.recipes.tags(RECIPE_ID),
            { tag_ids: [] },
        );
    });

    it("should put the tag back when saving fails", async () => {
        setup([QUICK]);
        mockedPut.mockRejectedValue(makeAxiosError(500, "offline"));

        const user = setupUser();

        await openEditor(user);

        await user.click(screen.getByRole("checkbox", { name: QUICK.name }));

        expect(
            await screen.findByRole("checkbox", {
                name: QUICK.name,
                checked: true,
            }),
        ).toBeInTheDocument();
    });

    it("should create a tag and attach it to the recipe", async () => {
        setup();
        mockedPost.mockResolvedValue({ data: { id: 9, name: "Weeknight" } });
        mockedPut.mockResolvedValue({ data: null });

        const user = setupUser();

        await openEditor(user);

        await user.type(
            screen.getByLabelText("New tag name"),
            "Weeknight{Enter}",
        );

        expect(mockedPost).toHaveBeenCalledWith(API_ROUTES.tags.list, {
            name: "Weeknight",
        });
        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.recipes.tags(RECIPE_ID),
            { tag_ids: [9] },
        );
    });

    it("should invite the viewer to create a first tag", async () => {
        setup([], []);

        await openEditor(setupUser());

        expect(
            screen.getByText(
                "You have no tags yet. Create your first one above.",
            ),
        ).toBeInTheDocument();
    });
});
