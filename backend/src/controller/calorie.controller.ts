import type { RequestHandler } from "express";

import { translateMessage } from "i18n/translate";

import type DeleteIntake from "application/use-cases/calories/DeleteIntake";
import type GetIntakeLog from "application/use-cases/calories/GetIntakeLog";
import type LogIntake from "application/use-cases/calories/LogIntake";
import type UpdateCalorieGoal from "application/use-cases/calories/UpdateCalorieGoal";

import { getUserId } from "./requestUser";

interface CalorieControllerDependencies {
    getIntakeLog: GetIntakeLog;
    logIntake: LogIntake;
    deleteIntake: DeleteIntake;
    updateCalorieGoal: UpdateCalorieGoal;
}

export default class CalorieController {
    private getIntakeLogUseCase: GetIntakeLog;
    private logIntakeUseCase: LogIntake;
    private deleteIntakeUseCase: DeleteIntake;
    private updateCalorieGoalUseCase: UpdateCalorieGoal;

    constructor({
        getIntakeLog,
        logIntake,
        deleteIntake,
        updateCalorieGoal,
    }: CalorieControllerDependencies) {
        this.getIntakeLogUseCase = getIntakeLog;
        this.logIntakeUseCase = logIntake;
        this.deleteIntakeUseCase = deleteIntake;
        this.updateCalorieGoalUseCase = updateCalorieGoal;
    }

    getIntakeLog: RequestHandler = async (req, res) => {
        const userId = getUserId(req);
        const entries = await this.getIntakeLogUseCase.execute(
            userId,
            req.query,
        );

        res.status(200).json(entries);
    };

    logIntake: RequestHandler = async (req, res) => {
        const userId = getUserId(req);
        const entry = await this.logIntakeUseCase.execute(userId, req.body);

        res.status(201).json(entry);
    };

    deleteIntake: RequestHandler<{ intakeId: string }> = async (req, res) => {
        const userId = getUserId(req);

        await this.deleteIntakeUseCase.execute(userId, req.params.intakeId);

        res.status(200).json({ message: translateMessage("intakeDeleted") });
    };

    updateCalorieGoal: RequestHandler = async (req, res) => {
        const userId = getUserId(req);

        await this.updateCalorieGoalUseCase.execute(userId, req.body);

        res.status(200).json({
            message: translateMessage("calorieGoalUpdated"),
        });
    };
}
