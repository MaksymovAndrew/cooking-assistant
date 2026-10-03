import express, { type Router } from "express";

import { ROUTES } from "constants/routes";

import type HealthController from "controller/health.controller";

export default function createHealthRouter(
    healthController: HealthController,
): Router {
    const router = express.Router();

    // no auth; it asks the database too, since a backend that cannot reach it serves nothing
    router.get(ROUTES.health, healthController.check);

    return router;
}
