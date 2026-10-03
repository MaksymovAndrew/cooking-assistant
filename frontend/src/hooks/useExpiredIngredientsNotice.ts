import { useEffect, useRef } from "react";

import type { ExpiredLot, ExpiredPantryIngredient } from "types/expiry";
import type { UserIngredient } from "types/userIngredient";

import { useAppDispatch, useAppSelector } from "redux/hooks";
import {
    selectIsAuthed,
    selectIsChecking,
} from "redux/selectors/sessionSelectors";
import { selectActiveModal } from "redux/selectors/uiSelectors";
import { useGetUserIngredientsQuery } from "redux/services/userIngredientsApi";
import { MODAL_TYPE, openModal } from "redux/slices/uiSlice";

import {
    hasShownExpiredIngredientsNotice,
    markExpiredIngredientsNoticeShown,
} from "utils/expiredIngredientsNoticeStorage";
import { computeExpiryDate, getExpiryStatus } from "utils/expiry";

// every expired lot, since one ingredient can hold an expired lot and a fresh one
const toExpiredIngredient = (
    ingredient: UserIngredient,
): ExpiredPantryIngredient | null => {
    if (typeof ingredient.days_to_expire !== "number") {
        return null;
    }

    const daysToExpire = ingredient.days_to_expire;
    const expiredLots: ExpiredLot[] = ingredient.lots
        .filter(
            (lot) =>
                getExpiryStatus(daysToExpire, lot.purchase_date)?.tone ===
                "expired",
        )
        .map((lot) => ({
            purchaseId: lot.id,
            quantity: lot.quantity,
            purchaseDate: lot.purchase_date,
            expiryDate: computeExpiryDate(
                lot.purchase_date,
                daysToExpire,
            ).toISOString(),
        }));

    return expiredLots.length > 0
        ? {
              ingredientId: ingredient.ingredient_id,
              slug: ingredient.ingredient_slug,
              name: ingredient.ingredient_name,
              unitName: ingredient.unit_name,
              lots: expiredLots,
          }
        : null;
};

const isExpiringIngredient = (
    item: ExpiredPantryIngredient | null,
): item is ExpiredPantryIngredient => item !== null;

interface UseExpiredIngredientsNoticeOptions {
    // "not yet", not "used up": the notice can still fire later on a route that doesn't skip it
    skip?: boolean;
}

// once per tab session: the first time the pantry holds an expired ingredient after login
export const useExpiredIngredientsNotice = ({
    skip: skipOption = false,
}: UseExpiredIngredientsNoticeOptions = {}): void => {
    const dispatch = useAppDispatch();
    const isChecking = useAppSelector(selectIsChecking);
    const isAuthed = useAppSelector(selectIsAuthed);
    const activeModal = useAppSelector(selectActiveModal);
    const skip = skipOption || isChecking || !isAuthed;
    const { data: pantry } = useGetUserIngredientsQuery(null, { skip });
    const hasFired = useRef(false);
    const enqueuedId = useRef<string | null>(null);

    useEffect(() => {
        const notReady = skip || !pantry;

        if (notReady || hasFired.current) {
            return;
        }

        if (hasShownExpiredIngredientsNotice()) {
            hasFired.current = true;

            return;
        }

        const expired = pantry
            .map(toExpiredIngredient)
            .filter(isExpiringIngredient);

        if (expired.length === 0) {
            return;
        }

        hasFired.current = true;
        enqueuedId.current = dispatch(
            openModal({
                type: MODAL_TYPE.expiredIngredients,
                ingredients: expired,
            }),
        ).payload.id;
    }, [skip, pantry, dispatch]);

    // marked when shown, not when queued, or a notice waiting behind another modal is never seen
    useEffect(() => {
        if (
            enqueuedId.current === null ||
            activeModal?.id !== enqueuedId.current
        ) {
            return;
        }

        enqueuedId.current = null;
        markExpiredIngredientsNoticeShown();
    }, [activeModal]);
};
