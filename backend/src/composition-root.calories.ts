import type { CalorieRepository } from "domain/repositories/CalorieRepository";

import DeleteIntake from "application/use-cases/calories/DeleteIntake";
import GetIntakeLog from "application/use-cases/calories/GetIntakeLog";
import LogIntake from "application/use-cases/calories/LogIntake";
import UpdateCalorieGoal from "application/use-cases/calories/UpdateCalorieGoal";

import CalorieController from "controller/calorie.controller";

export function buildCaloriesController(
    calorieRepository: CalorieRepository,
): CalorieController {
    return new CalorieController({
        getIntakeLog: new GetIntakeLog(calorieRepository),
        logIntake: new LogIntake(calorieRepository),
        deleteIntake: new DeleteIntake(calorieRepository),
        updateCalorieGoal: new UpdateCalorieGoal(calorieRepository),
    });
}
