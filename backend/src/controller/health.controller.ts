import type { RequestHandler } from "express";

import type CheckHealth from "application/use-cases/health/CheckHealth";

interface HealthControllerDependencies {
    checkHealth: CheckHealth;
}

const SERVICE_UNAVAILABLE = 503;

export default class HealthController {
    private checkHealthUseCase: CheckHealth;

    constructor({ checkHealth }: HealthControllerDependencies) {
        this.checkHealthUseCase = checkHealth;
    }

    // the compose health check, deploy.sh and uptime checks all look for "ok" in this body
    check: RequestHandler = async (_req, res) => {
        const healthy = await this.checkHealthUseCase.execute();

        if (!healthy) {
            res.status(SERVICE_UNAVAILABLE).json({ status: "unavailable" });

            return;
        }

        res.json({ status: "ok" });
    };
}
