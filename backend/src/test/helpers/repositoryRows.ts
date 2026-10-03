import type { CatalogIngredient } from "domain/repositories/IngredientRepository";
import type { MenuDetail } from "domain/repositories/menu.types";
import type { MenuStatisticsDto } from "domain/repositories/menuStats.types";
import type {
    PantryIngredient,
    PurchaseHistoryEntry,
} from "domain/repositories/PantryRepository";
import type {
    RecipeDetailRow,
    RecipeRow,
} from "domain/repositories/recipe.types";
import type { RecordAuthor } from "domain/repositories/recordAuthor";

const CREATED_AT = new Date("2026-01-01T00:00:00.000Z");

const AUTHOR: RecordAuthor = {
    name: "Anna",
    surname_initial: "K",
    avatar: null,
    avatar_photo_key: null,
};

export function recipeRow(overrides: Partial<RecipeRow> = {}): RecipeRow {
    return {
        id: 12,
        title: "Soup",
        content: "Boil it",
        language: "en",
        person_id: 7,
        type_id: null,
        creation_date: CREATED_AT,
        cooking_time: null,
        calories_override: null,
        calories_computed: null,
        photo_key: null,
        ...overrides,
    };
}

export function recipeDetailRow(
    overrides: Partial<RecipeDetailRow> = {},
): RecipeDetailRow {
    return {
        id: 12,
        title: "Soup",
        content: "Boil it",
        language: "en",
        type_id: null,
        creation_date: CREATED_AT,
        cooking_time: null,
        calories_override: null,
        calories_computed: null,
        type_name: null,
        ingredients: [],
        isOwner: false,
        isFavourite: null,
        containsAvoided: null,
        tags: null,
        calories_per_portion: null,
        photo_key: null,
        author: AUTHOR,
        ratingAverage: null,
        ratingCount: 0,
        myRating: null,
        ...overrides,
    };
}

export function menuStatistics(
    overrides: Partial<MenuStatisticsDto> = {},
): MenuStatisticsDto {
    return {
        menusCount: 0,
        menuCountByCategory: [],
        mostUsedCategory: null,
        averageTotalTime: null,
        averageRecipesPerMenu: null,
        averageTotalTimeByCategory: [],
        fastestMenus: [],
        slowestMenus: [],
        mostRecipesMenus: [],
        leastRecipesMenus: [],
        averageCaloriesOverall: null,
        mostCaloricMenus: [],
        leastCaloricMenus: [],
        ...overrides,
    };
}

export function menuDetail(
    overrides: Partial<MenuDetail["menu"]> = {},
): MenuDetail {
    return {
        menu: {
            id: 9,
            title: "Weekly menu",
            menuContent: null,
            language: "en",
            categoryName: "Dinner",
            category_id: 2,
            photo_key: null,
            creation_date: CREATED_AT,
            isOwner: false,
            isFavourite: null,
            author: AUTHOR,
            ratingAverage: null,
            ratingCount: 0,
            myRating: null,
            ...overrides,
        },
        recipes: [],
        allergens: [],
    };
}

export function pantryIngredient(
    overrides: Partial<PantryIngredient> = {},
): PantryIngredient {
    return {
        ingredient_id: 3,
        ingredient_slug: "tomato",
        ingredient_name: "Tomato",
        category: "vegetables",
        quantity_person_ingradient: 2,
        unit_name: "pcs",
        allergens: [],
        days_to_expire: null,
        seasonality: null,
        storage_condition: null,
        purchase_date: CREATED_AT,
        lots: [],
        calories_per_unit: null,
        ...overrides,
    };
}

export function purchaseHistoryEntry(
    overrides: Partial<PurchaseHistoryEntry> = {},
): PurchaseHistoryEntry {
    return {
        id: 11,
        quantity: 2,
        purchase_date: CREATED_AT,
        unit_name: "pcs",
        days_to_expire: null,
        ...overrides,
    };
}

export function catalogIngredient(
    overrides: Partial<CatalogIngredient> = {},
): CatalogIngredient {
    return {
        id: 3,
        slug: "tomato",
        name: "Tomato",
        category: "vegetables",
        unit_name: "pcs",
        allergens: [],
        days_to_expire: null,
        calories_per_unit: null,
        ...overrides,
    };
}
