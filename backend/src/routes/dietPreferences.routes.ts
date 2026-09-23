import express, { type Router } from "express";

import { ROUTES } from "constants/routes";

import type DietPreferencesController from "controller/dietPreferences.controller";
import type { SessionAuth } from "middleware/jwtMiddleware";

export default function createDietPreferencesRouter(
    dietPreferencesController: DietPreferencesController,
    { authenticateToken }: SessionAuth,
): Router {
    const router = express.Router();

    router.get(
        ROUTES.dietPreferences.get,
        authenticateToken,
        dietPreferencesController.getDietPreferences,
    );

    router.put(
        ROUTES.dietPreferences.allergen,
        authenticateToken,
        dietPreferencesController.addAvoidedAllergen,
    );

    router.delete(
        ROUTES.dietPreferences.allergen,
        authenticateToken,
        dietPreferencesController.removeAvoidedAllergen,
    );

    router.put(
        ROUTES.ingredients.avoid,
        authenticateToken,
        dietPreferencesController.addAvoidedIngredient,
    );

    router.delete(
        ROUTES.ingredients.avoid,
        authenticateToken,
        dietPreferencesController.removeAvoidedIngredient,
    );

    return router;
}
