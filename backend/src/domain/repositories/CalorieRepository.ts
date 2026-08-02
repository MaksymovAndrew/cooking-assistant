export interface CalorieIntakeRow {
    id: number;
    person_id: number;
    recipe_id: number | null;
    menu_id: number | null;
    title: string;
    portions: number;
    calories: number;
    eaten_at: string;
}

export interface CalorieIntakeEntry {
    recipe_id?: number;
    menu_id?: number;
    title: string;
    portions: number;
    calories: number;
}

export interface CalorieGoal {
    calorie_goal: number | null;
    meal_calorie_limit: number | null;
}

// title/calories as they exist right now - the source for a fresh intake log snapshot, not the snapshot itself
export interface CalorieSourceInfo {
    title: string;
    calories: number | null;
}

export interface CalorieRepository {
    findIntake(
        personId: number,
        from: string,
        to: string,
    ): Promise<CalorieIntakeRow[]>;
    logIntake(
        personId: number,
        entry: CalorieIntakeEntry,
    ): Promise<CalorieIntakeRow>;
    deleteIntake(personId: number, intakeId: number): Promise<boolean>;
    findRecipeCalories(recipeId: number): Promise<CalorieSourceInfo | null>;
    findMenuCalories(menuId: number): Promise<CalorieSourceInfo | null>;
    updateGoal(personId: number, goal: CalorieGoal): Promise<void>;
}
