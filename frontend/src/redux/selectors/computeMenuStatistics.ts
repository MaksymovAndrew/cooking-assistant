import type { MenuWithStats } from "types/menu";
import type {
    AverageTimeByCategory,
    MenuCategoryStat,
    MenuStatistics,
} from "types/stats";

import { averageByGroup, findExtremes, findMostUsed } from "./statsHelpers";

const computeAverageTotalTimeByCategory = (
    menus: MenuWithStats[],
): AverageTimeByCategory[] =>
    averageByGroup(
        menus,
        (menu) => menu.categoryname,
        (menu) => menu.total_cooking_time,
    ).map(({ group, average }) => ({
        categoryname: group,
        averageTotalTime: average,
    }));

const hasCalories = (
    menu: MenuWithStats,
): menu is MenuWithStats & { total_calories: number } =>
    menu.total_calories !== null;

export const computeMenuStatistics = (
    menus: MenuWithStats[],
): MenuStatistics => {
    const categoryCounts: Record<string, number> = {};

    menus.forEach((menu) => {
        categoryCounts[menu.categoryname] =
            (categoryCounts[menu.categoryname] || 0) + 1;
    });

    const menuCountByCategory: MenuCategoryStat[] = Object.entries(
        categoryCounts,
    ).map(([categoryname, menuCount]) => ({ categoryname, menuCount }));

    if (menus.length === 0) {
        return {
            menusCount: 0,
            menuCountByCategory,
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
        };
    }

    const totalTime = menus.reduce((sum, m) => sum + m.total_cooking_time, 0);
    const totalRecipes = menus.reduce((sum, m) => sum + m.recipe_count, 0);
    const timeExtremes = findExtremes(menus, (m) => m.total_cooking_time);
    const recipeCountExtremes = findExtremes(menus, (m) => m.recipe_count);
    const menusWithCalories = menus.filter(hasCalories);
    const calorieExtremes = findExtremes(
        menusWithCalories,
        (m) => m.total_calories,
    );
    const averageCaloriesOverall =
        menusWithCalories.length === 0
            ? null
            : Math.round(
                  menusWithCalories.reduce(
                      (sum, m) => sum + m.total_calories,
                      0,
                  ) / menusWithCalories.length,
              );

    return {
        menusCount: menus.length,
        menuCountByCategory,
        mostUsedCategory: findMostUsed(
            menuCountByCategory,
            (stat) => stat.menuCount,
        ),
        averageTotalTime: Math.round(totalTime / menus.length),
        averageRecipesPerMenu: totalRecipes / menus.length,
        averageTotalTimeByCategory: computeAverageTotalTimeByCategory(menus),
        fastestMenus: timeExtremes.min,
        slowestMenus: timeExtremes.max,
        mostRecipesMenus: recipeCountExtremes.max,
        leastRecipesMenus: recipeCountExtremes.min,
        averageCaloriesOverall,
        mostCaloricMenus: calorieExtremes.max,
        leastCaloricMenus: calorieExtremes.min,
    };
};
