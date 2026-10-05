export interface DurationCopy {
    hoursMinutes: string;
    hours: string;
    minutes: string;
}

// keys are relative to the namespace of the t that reads them
export const RECIPE_DURATION_COPY: DurationCopy = {
    hoursMinutes: "recipeDetailsPage.cookingTimeHoursMinutes",
    hours: "recipeDetailsPage.cookingTimeHours",
    minutes: "recipeDetailsPage.cookingTimeMinutes",
};

export const STATS_DURATION_COPY: DurationCopy = {
    hoursMinutes: "statsPage.timeCompactHoursMinutes",
    hours: "statsPage.timeCompactHours",
    minutes: "statsPage.timeMinutesOnly",
};

export const HOME_DURATION_COPY: DurationCopy = {
    hoursMinutes: "recentRecipes.cookingTimeHoursMinutes",
    hours: "recentRecipes.cookingTimeHours",
    minutes: "recentRecipes.cookingTimeMinutesOnly",
};

export const MENU_DURATION_COPY: DurationCopy = {
    hoursMinutes: "menuDetailsPage.totalTimeHoursMinutes",
    hours: "menuDetailsPage.totalTimeHours",
    minutes: "menuDetailsPage.totalTimeMinutes",
};
