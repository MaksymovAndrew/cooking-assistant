import type { RequestHandler } from "express";

import { requestLocale } from "i18n/requestLocale";
import { translateMessage } from "i18n/translate";

import type CookRecord from "application/use-cases/pantry/CookRecord";
import type UndoCooking from "application/use-cases/pantry/UndoCooking";

import { getUserId } from "./requestUser";

interface PantryConsumptionControllerDependencies {
    cookRecord: CookRecord;
    undoCooking: UndoCooking;
}

export default class PantryConsumptionController {
    private cookRecordUseCase: CookRecord;
    private undoCookingUseCase: UndoCooking;

    constructor({
        cookRecord,
        undoCooking,
    }: PantryConsumptionControllerDependencies) {
        this.cookRecordUseCase = cookRecord;
        this.undoCookingUseCase = undoCooking;
    }

    cookRecord: RequestHandler = async (req, res) => {
        const userId = getUserId(req);
        const summary = await this.cookRecordUseCase.execute(userId, req.body);

        res.status(201).json(summary);
    };

    undoCooking: RequestHandler<{ consumptionId: string }> = async (
        req,
        res,
    ) => {
        const userId = getUserId(req);

        await this.undoCookingUseCase.execute(userId, req.params.consumptionId);

        res.status(200).json({
            message: translateMessage("cookingUndone", requestLocale(req)),
        });
    };
}
