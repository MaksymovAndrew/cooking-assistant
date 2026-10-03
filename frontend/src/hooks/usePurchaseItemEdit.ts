import type React from "react";
import { useEffect, useRef, useState } from "react";

import type { Purchase } from "types/userIngredient";

import { useEditableQuantity } from "hooks/useEditableQuantity";

import { ignoreRejection } from "utils/ignoreRejection";

// the backend's positive-quantity floor; purchases can be fractional (kg, l)
export const MIN_PURCHASE_QUANTITY = 0.01;

// read-only until the edit button is pressed, so a stray tap can never change a saved lot
export const usePurchaseItemEdit = (
    purchase: Purchase,
    onQuantityChange: (id: number, quantity: number) => void,
    onSave: (id: number, quantity: number) => Promise<void>,
) => {
    const [isEditing, setIsEditing] = useState(false);
    const editingRef = useRef(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const quantity = useEditableQuantity(
        purchase.quantity,
        (value) => {
            onQuantityChange(purchase.id, value);
        },
        MIN_PURCHASE_QUANTITY,
    );

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus();

            return;
        }

        // the focused field is gone: refocus its trigger unless the user already moved on
        const isFocusLost = document.activeElement === document.body;

        if (isFocusLost) {
            triggerRef.current?.focus();
        }
    }, [isEditing]);

    const setEditing = (next: boolean) => {
        editingRef.current = next;
        setIsEditing(next);
    };

    // Enter unmounts the field, and a browser may still report a blur for it - save only once
    const finishEditing = () => {
        if (!editingRef.current) {
            return;
        }

        setEditing(false);
        onSave(purchase.id, quantity.onBlur()).catch(ignoreRejection);
    };

    return {
        isEditing,
        startEditing: () => {
            setEditing(true);
        },
        finishEditing,
        onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Enter") {
                event.preventDefault();
                finishEditing();
            }
        },
        inputRef,
        triggerRef,
        text: quantity.text,
        onChange: quantity.onChange,
    };
};
