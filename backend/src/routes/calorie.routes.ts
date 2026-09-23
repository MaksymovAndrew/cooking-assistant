import express, { type Router } from "express";

import { ROUTES } from "constants/routes";

import type CalorieController from "controller/calorie.controller";
import type { SessionAuth } from "middleware/jwtMiddleware";

export default function createCalorieRouter(
    calorieController: CalorieController,
    { authenticateToken }: SessionAuth,
): Router {
    const router = express.Router();

    // the user always comes from the auth cookie, never from the path

    router.get(
        ROUTES.calories.intake,
        authenticateToken,
        calorieController.getIntakeLog,
    );

    router.post(
        ROUTES.calories.intake,
        authenticateToken,
        calorieController.logIntake,
    );

    router.delete(
        ROUTES.calories.intakeById,
        authenticateToken,
        calorieController.deleteIntake,
    );

    router.put(
        ROUTES.calories.goal,
        authenticateToken,
        calorieController.updateCalorieGoal,
    );

    return router;
}
