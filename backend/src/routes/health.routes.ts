import express, { type Router } from "express";

import { ROUTES } from "constants/routes";

import type HealthController from "controller/health.controller";

export default function createHealthRouter(
    healthController: HealthController,
): Router {
    const router = express.Router();

    // liveness probe, no auth; it also asks the database, since a backend that cannot reach it serves nothing
    router.get(ROUTES.health, healthController.check);

    return router;
}
