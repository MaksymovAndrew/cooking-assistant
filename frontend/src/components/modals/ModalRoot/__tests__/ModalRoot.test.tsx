import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { CurrentUser } from "types/auth";
import type { PantryIngredient } from "types/userIngredient";

import { selectActiveModal } from "redux/selectors/uiSelectors";
import type { ActiveModal } from "redux/slices/uiSlice";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { ModalRoot } from "components/modals";

import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

// each modal stands in as its own name, so a test sees which one ModalRoot mounted
const mockStandIn = (name: string) => ({
    [name]: () => <p>{name}</p>,
});

jest.mock("components/modals/PurchaseHistoryModal", () => ({
    PurchaseHistoryModal: ({ onClose }: { onClose: () => void }) => (
        <button type="button" onClick={onClose}>
            PurchaseHistoryModal
        </button>
    ),
}));
jest.mock("components/modals/DeleteRecipeModal", () =>
    mockStandIn("DeleteRecipeModal"),
);
jest.mock("components/modals/DeleteMenuModal", () =>
    mockStandIn("DeleteMenuModal"),
);
jest.mock("components/modals/DeleteIngredientModal", () =>
    mockStandIn("DeleteIngredientModal"),
);
jest.mock("components/modals/RestockIngredientModal", () =>
    mockStandIn("RestockIngredientModal"),
);
jest.mock("components/modals/LogoutConfirmModal", () =>
    mockStandIn("LogoutConfirmModal"),
);
jest.mock("components/modals/SignOutEverywhereModal", () =>
    mockStandIn("SignOutEverywhereModal"),
);
jest.mock("components/modals/ThemeChangeConfirmModal", () =>
    mockStandIn("ThemeChangeConfirmModal"),
);
jest.mock("components/modals/ExpiredIngredientsModal", () =>
    mockStandIn("ExpiredIngredientsModal"),
);
jest.mock("components/modals/DeleteCalorieIntakeModal", () =>
    mockStandIn("DeleteCalorieIntakeModal"),
);
jest.mock("components/modals/CalorieLimitModal", () =>
    mockStandIn("CalorieLimitModal"),
);
jest.mock("components/modals/LogIntakeModal", () =>
    mockStandIn("LogIntakeModal"),
);
jest.mock("components/modals/NewsModal", () => mockStandIn("NewsModal"));
jest.mock("components/connectivity/OfflineModal", () =>
    mockStandIn("OfflineModal"),
);
jest.mock("components/modals/DeleteTagModal", () =>
    mockStandIn("DeleteTagModal"),
);
jest.mock("components/modals/CookedItModal", () =>
    mockStandIn("CookedItModal"),
);
jest.mock("components/ingredients/AddIngredientModal", () =>
    mockStandIn("PantryAddIngredientModal"),
);
jest.mock("components/profile/EditProfileModal", () =>
    mockStandIn("EditProfileModal"),
);
jest.mock("components/settings/ChangePasswordModal", () =>
    mockStandIn("ChangePasswordModal"),
);
jest.mock("components/settings/DeleteAccountModal", () =>
    mockStandIn("DeleteAccountModal"),
);

const MODAL_ID = "modal-1";

const INGREDIENT: PantryIngredient = {
    id: 9,
    slug: "salt",
    ingredient_name: "Salt",
    category: "spices",
    unit_name: "g",
    quantity_person_ingradient: 100,
    allergens: [],
    lots: [],
};

const CURRENT_USER: CurrentUser = {
    id: 1,
    name: "Claude",
    surname: "Cook",
    login: "claude",
    created_at: "2025-06-15T00:00:00.000Z",
    email: "claude@example.com",
    email_verified_at: null,
    avatar: null,
    avatar_photo_key: null,
    calorie_goal: null,
    locale: "en",
};

type ModalOf<Type extends ActiveModal["type"]> = Extract<
    ActiveModal,
    { type: Type }
>;

const HISTORY: ModalOf<"ingredientHistory"> = {
    id: MODAL_ID,
    type: MODAL_TYPE.ingredientHistory,
    ingredientId: 7,
    ingredientName: "Salt",
};

// keyed by type, so a modal type without a row here fails to compile
const MOUNTED_BY_TYPE: {
    [Type in ActiveModal["type"]]: [string, ModalOf<Type>];
} = {
    ingredientHistory: ["PurchaseHistoryModal", HISTORY],
    deleteRecipe: [
        "DeleteRecipeModal",
        {
            id: MODAL_ID,
            type: MODAL_TYPE.deleteRecipe,
            recipeId: "42",
            recipeTitle: "Slow-roasted ragù",
        },
    ],
    deleteMenu: [
        "DeleteMenuModal",
        {
            id: MODAL_ID,
            type: MODAL_TYPE.deleteMenu,
            menuId: 7,
            menuTitle: "Week of Comfort",
        },
    ],
    deleteIngredient: [
        "DeleteIngredientModal",
        {
            id: MODAL_ID,
            type: MODAL_TYPE.deleteIngredient,
            ingredient: INGREDIENT,
        },
    ],
    restockIngredient: [
        "RestockIngredientModal",
        {
            id: MODAL_ID,
            type: MODAL_TYPE.restockIngredient,
            ingredient: INGREDIENT,
        },
    ],
    logout: ["LogoutConfirmModal", { id: MODAL_ID, type: MODAL_TYPE.logout }],
    signOutEverywhere: [
        "SignOutEverywhereModal",
        { id: MODAL_ID, type: MODAL_TYPE.signOutEverywhere },
    ],
    themeChange: [
        "ThemeChangeConfirmModal",
        { id: MODAL_ID, type: MODAL_TYPE.themeChange, nextMode: "dark" },
    ],
    expiredIngredients: [
        "ExpiredIngredientsModal",
        { id: MODAL_ID, type: MODAL_TYPE.expiredIngredients, ingredients: [] },
    ],
    deleteCalorieIntake: [
        "DeleteCalorieIntakeModal",
        {
            id: MODAL_ID,
            type: MODAL_TYPE.deleteCalorieIntake,
            intakeId: 9,
            title: "Miso ramen",
        },
    ],
    calorieLimit: [
        "CalorieLimitModal",
        {
            id: MODAL_ID,
            type: MODAL_TYPE.calorieLimit,
            consumed: 2520,
            goal: 2200,
        },
    ],
    logIntake: [
        "LogIntakeModal",
        {
            id: MODAL_ID,
            type: MODAL_TYPE.logIntake,
            recipeId: 7,
            title: "Chicken teriyaki don",
            caloriesPerPortion: 620,
        },
    ],
    news: ["NewsModal", { id: MODAL_ID, type: MODAL_TYPE.news }],
    offline: ["OfflineModal", { id: MODAL_ID, type: MODAL_TYPE.offline }],
    deleteTag: [
        "DeleteTagModal",
        {
            id: MODAL_ID,
            type: MODAL_TYPE.deleteTag,
            tagId: 3,
            tagName: "Weeknight",
        },
    ],
    cookedIt: [
        "CookedItModal",
        {
            id: MODAL_ID,
            type: MODAL_TYPE.cookedIt,
            recipeId: 7,
            title: "Chicken teriyaki don",
            requirements: [],
            caloriesPerPortion: 620,
        },
    ],
    addIngredient: [
        "PantryAddIngredientModal",
        { id: MODAL_ID, type: MODAL_TYPE.addIngredient },
    ],
    editProfile: [
        "EditProfileModal",
        {
            id: MODAL_ID,
            type: MODAL_TYPE.editProfile,
            currentUser: CURRENT_USER,
        },
    ],
    changePassword: [
        "ChangePasswordModal",
        { id: MODAL_ID, type: MODAL_TYPE.changePassword },
    ],
    deleteAccount: [
        "DeleteAccountModal",
        { id: MODAL_ID, type: MODAL_TYPE.deleteAccount, login: "claude" },
    ],
};

const renderModalRoot = (queue: ActiveModal[]) =>
    renderWithProviders(<ModalRoot />, {
        store: makeTestStore({ ui: { queue } }),
    });

describe("ModalRoot", () => {
    it.each(Object.values(MOUNTED_BY_TYPE))(
        "should mount %s for its modal type",
        async (name, modal) => {
            renderModalRoot([modal]);

            expect(await screen.findByText(name)).toBeInTheDocument();
        },
    );

    it("should close the modal when the child requests it", async () => {
        const { store } = renderModalRoot([HISTORY]);

        await userEvent.click(
            await screen.findByRole("button", { name: "PurchaseHistoryModal" }),
        );

        expect(selectActiveModal(store.getState())).toBeNull();
    });

    it("should render nothing when no modal is open", () => {
        const { container } = renderModalRoot([]);

        expect(container).toBeEmptyDOMElement();
    });

    it("should render only the head of the queue", async () => {
        renderModalRoot([
            { id: MODAL_ID, type: MODAL_TYPE.logout },
            { id: "modal-2", type: MODAL_TYPE.news },
        ]);

        expect(
            await screen.findByText("LogoutConfirmModal"),
        ).toBeInTheDocument();
        expect(screen.queryByText("NewsModal")).not.toBeInTheDocument();
    });
});
