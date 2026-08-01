import express, { type Router } from "express";

import type CalorieController from "controller/calorie.controller";
import authenticateToken from "middleware/jwtMiddleware";

export default function createCalorieRouter(
    calorieController: CalorieController,
): Router {
    const router = express.Router();

    // the user always comes from the auth cookie, never from the path

    router.get(
        "/calorie-intake",
        authenticateToken,
        calorieController.getIntakeLog,
    );

    router.post(
        "/calorie-intake",
        authenticateToken,
        calorieController.logIntake,
    );

    router.delete(
        "/calorie-intake/:intakeId",
        authenticateToken,
        calorieController.deleteIntake,
    );

    router.put(
        "/calorie-goal",
        authenticateToken,
        calorieController.updateCalorieGoal,
    );

    return router;
}
