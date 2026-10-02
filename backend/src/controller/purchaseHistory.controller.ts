import type { RequestHandler } from "express";

import { requestLocale } from "i18n/requestLocale";
import { translateMessage } from "i18n/translate";

import type DeletePurchase from "application/use-cases/pantry/DeletePurchase";
import type DiscardPurchases from "application/use-cases/pantry/DiscardPurchases";
import type GetPurchaseHistory from "application/use-cases/pantry/GetPurchaseHistory";
import type UpdatePurchaseQuantity from "application/use-cases/pantry/UpdatePurchaseQuantity";

import { requestBody } from "./requestBody";
import { getUserId } from "./requestUser";

interface PurchaseHistoryControllerDependencies {
    updatePurchaseQuantity: UpdatePurchaseQuantity;
    getPurchaseHistory: GetPurchaseHistory;
    deletePurchase: DeletePurchase;
    discardPurchases: DiscardPurchases;
}

// the lots behind each pantry item: what was bought when, and corrections to it
export default class PurchaseHistoryController {
    private updatePurchaseQuantityUseCase: UpdatePurchaseQuantity;
    private getPurchaseHistoryUseCase: GetPurchaseHistory;
    private deletePurchaseUseCase: DeletePurchase;
    private discardPurchasesUseCase: DiscardPurchases;

    constructor({
        updatePurchaseQuantity,
        getPurchaseHistory,
        deletePurchase,
        discardPurchases,
    }: PurchaseHistoryControllerDependencies) {
        this.updatePurchaseQuantityUseCase = updatePurchaseQuantity;
        this.getPurchaseHistoryUseCase = getPurchaseHistory;
        this.deletePurchaseUseCase = deletePurchase;
        this.discardPurchasesUseCase = discardPurchases;
    }

    updatePurchaseQuantity: RequestHandler<{ purchaseId: string }> = async (
        req,
        res,
    ) => {
        const { quantity } = requestBody(req);

        await this.updatePurchaseQuantityUseCase.execute(
            getUserId(req),
            req.params.purchaseId,
            quantity,
        );

        res.status(200).json({
            message: translateMessage("purchaseUpdated", requestLocale(req)),
        });
    };

    deletePurchase: RequestHandler<{ purchaseId: string }> = async (
        req,
        res,
    ) => {
        await this.deletePurchaseUseCase.execute(
            getUserId(req),
            req.params.purchaseId,
        );

        res.json({
            message: translateMessage("purchaseDeleted", requestLocale(req)),
        });
    };

    discardPurchases: RequestHandler = async (req, res) => {
        const { purchaseIds } = requestBody(req);
        const discarded = await this.discardPurchasesUseCase.execute(
            getUserId(req),
            purchaseIds,
        );

        res.json({ discarded });
    };

    getPurchaseHistory: RequestHandler<{ ingredientId: string }> = async (
        req,
        res,
    ) => {
        const history = await this.getPurchaseHistoryUseCase.execute(
            getUserId(req),
            req.params.ingredientId,
        );

        res.json(history);
    };
}
