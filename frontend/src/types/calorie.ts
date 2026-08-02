export interface CalorieIntakeItem {
    id: number;
    person_id: number;
    recipe_id: number | null;
    menu_id: number | null;
    title: string;
    portions: number;
    calories: number;
    eaten_at: string;
}

export interface IntakeRangeParams {
    from: string;
    to: string;
}

export interface LogIntakeRequest {
    recipe_id?: number;
    menu_id?: number;
    portions: number;
}

export interface UpdateCalorieGoalRequest {
    calorie_goal: number | null;
    meal_calorie_limit: number | null;
}
