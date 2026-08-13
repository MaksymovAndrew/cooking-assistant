import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";
import type { PantryIngredient } from "types/userIngredient";

import { usePopoverDismiss } from "hooks/usePopoverDismiss";

import { BaseModal } from "components/modals/BaseModal";

import { AddIngredientModalFooter } from "./AddIngredientModalFooter";
import { AddIngredientPickerStep } from "./AddIngredientPickerStep";
import { AddIngredientQuantityStep } from "./AddIngredientQuantityStep";

interface AddIngredientModalProps {
    allIngredients: Ingredient[];
    personIngredients: PantryIngredient[];
    selectedIngredients: number[];
    onToggle: (id: number) => void;
    onConfirm: (quantities: Record<number, number>) => void;
    onClose: () => void;
}

const DEFAULT_QUANTITY = 1;

export const AddIngredientModal: React.FC<AddIngredientModalProps> = ({
    allIngredients,
    personIngredients,
    selectedIngredients,
    onToggle,
    onConfirm,
    onClose,
}) => {
    const { t } = useTranslation("ingredients");
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<"pick" | "quantities">("pick");
    const [quantityIndex, setQuantityIndex] = useState(0);
    const [quantities, setQuantities] = useState<Record<number, number>>({});
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedIds = useMemo(
        () => new Set(selectedIngredients),
        [selectedIngredients],
    );
    const newlySelected = useMemo(
        () =>
            allIngredients.filter((ingredient) =>
                selectedIds.has(ingredient.id),
            ),
        [allIngredients, selectedIds],
    );

    usePopoverDismiss(containerRef, isOpen, () => {
        setIsOpen(false);
    });

    const handleStartQuantities = () => {
        setQuantities(
            Object.fromEntries(
                newlySelected.map((ingredient) => [
                    ingredient.id,
                    DEFAULT_QUANTITY,
                ]),
            ),
        );
        setQuantityIndex(0);
        setStep("quantities");
    };

    const handleQuantityBack = () => {
        if (quantityIndex === 0) {
            setStep("pick");

            return;
        }

        setQuantityIndex((prev) => prev - 1);
    };

    const isLastQuantityStep = quantityIndex === newlySelected.length - 1;

    const handleQuantityNext = () => {
        if (isLastQuantityStep) {
            onConfirm(quantities);

            return;
        }

        setQuantityIndex((prev) => prev + 1);
    };

    const currentIngredient =
        quantityIndex < newlySelected.length
            ? newlySelected[quantityIndex]
            : undefined;

    return (
        <BaseModal
            size="md"
            title={t("addIngredientModal.title")}
            onClose={onClose}
            // while the dropdown is open, its own Escape handler (usePopoverDismiss below) should close
            // just the dropdown - BaseModal's document-level listener is registered first (at mount) and
            // would otherwise fire first and close the whole modal on the same keypress
            closeOnEscape={step === "pick" ? !isOpen : true}
            footer={
                <AddIngredientModalFooter
                    step={step}
                    canContinue={newlySelected.length > 0}
                    isLastQuantityStep={isLastQuantityStep}
                    onCancel={onClose}
                    onContinue={handleStartQuantities}
                    onBack={handleQuantityBack}
                    onNext={handleQuantityNext}
                />
            }
        >
            {step === "pick" ? (
                <AddIngredientPickerStep
                    containerRef={containerRef}
                    allIngredients={allIngredients}
                    personIngredients={personIngredients}
                    selectedIngredients={selectedIngredients}
                    newlySelected={newlySelected}
                    onToggle={onToggle}
                    isOpen={isOpen}
                    onOpenChange={setIsOpen}
                />
            ) : (
                currentIngredient && (
                    <AddIngredientQuantityStep
                        ingredient={currentIngredient}
                        quantity={
                            quantities[currentIngredient.id] ?? DEFAULT_QUANTITY
                        }
                        stepNumber={quantityIndex + 1}
                        stepCount={newlySelected.length}
                        onQuantityChange={(quantity) => {
                            setQuantities((prev) => ({
                                ...prev,
                                [currentIngredient.id]: quantity,
                            }));
                        }}
                    />
                )
            )}
        </BaseModal>
    );
};
