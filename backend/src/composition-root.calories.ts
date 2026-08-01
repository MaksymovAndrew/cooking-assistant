import type { CalorieRepository } from "domain/repositories/CalorieRepository";

import DeleteIntake from "application/use-cases/calories/DeleteIntake";
import GetIntakeLog from "application/use-cases/calories/GetIntakeLog";
import LogIntake from "application/use-cases/calories/LogIntake";
import UpdateCalorieGoal from "application/use-cases/calories/UpdateCalorieGoal";

import CalorieController from "controller/calorie.controller";

// split out of composition-root.ts, which hit the file's line-count lint cap once this was inlined
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
