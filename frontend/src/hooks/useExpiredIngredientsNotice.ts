import { useEffect, useRef } from "react";

import type { ExpiringIngredient } from "types/expiry";
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
import { getExpiryStatus } from "utils/expiry";

const toExpiredIngredient = (
    ingredient: UserIngredient,
): ExpiringIngredient | null => {
    const status = getExpiryStatus(
        ingredient.days_to_expire,
        ingredient.purchase_date,
    );

    return status?.tone === "expired"
        ? {
              ingredientId: ingredient.ingredient_id,
              slug: ingredient.ingredient_slug,
              name: ingredient.ingredient_name,
              status,
          }
        : null;
};

const isExpiringIngredient = (
    item: ExpiringIngredient | null,
): item is ExpiringIngredient => item !== null;

// one-shot per tab session: opens the shared modal the first time the pantry is found to contain an expired ingredient after login
export const useExpiredIngredientsNotice = (): void => {
    const dispatch = useAppDispatch();
    const isChecking = useAppSelector(selectIsChecking);
    const isAuthed = useAppSelector(selectIsAuthed);
    const activeModal = useAppSelector(selectActiveModal);
    const { data: pantry } = useGetUserIngredientsQuery(null, {
        skip: isChecking || !isAuthed,
    });
    const hasFired = useRef(false);
    const enqueuedId = useRef<string | null>(null);

    useEffect(() => {
        const notReady = isChecking || !isAuthed || !pantry;

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
    }, [isChecking, isAuthed, pantry, dispatch]);

    // marks on presentation, not on enqueue - a notice still waiting behind another modal
    // would otherwise be silenced before it was ever seen
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
