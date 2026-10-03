export interface MenuCategoryStat {
    categoryName: string;
    menuCount: number;
}

export interface AverageTimeByCategory {
    categoryName: string;
    averageTotalTime: number;
}

export interface MenuStatsEntry {
    id: number;
    title: string;
    categoryName: string;
    recipe_count: number;
    total_cooking_time: number;
    total_calories: number | null;
}

export type MenuCalorieEntry = MenuStatsEntry & { total_calories: number };

export interface MenuStatisticsDto {
    menusCount: number;
    menuCountByCategory: MenuCategoryStat[];
    mostUsedCategory: MenuCategoryStat | null;
    averageTotalTime: number | null;
    averageRecipesPerMenu: number | null;
    averageTotalTimeByCategory: AverageTimeByCategory[];
    fastestMenus: MenuStatsEntry[];
    slowestMenus: MenuStatsEntry[];
    mostRecipesMenus: MenuStatsEntry[];
    leastRecipesMenus: MenuStatsEntry[];
    averageCaloriesOverall: number | null;
    mostCaloricMenus: MenuCalorieEntry[];
    leastCaloricMenus: MenuCalorieEntry[];
}
