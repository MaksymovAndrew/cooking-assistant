import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Ingredient } from "types/ingredient";
import type { PantryIngredient } from "types/userIngredient";

import { useAddIngredientWizard } from "hooks/useAddIngredientWizard";
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
    const containerRef = useRef<HTMLDivElement>(null);
    const wizard = useAddIngredientWizard(
        allIngredients,
        selectedIngredients,
        onConfirm,
    );
    const { currentIngredient } = wizard;

    usePopoverDismiss(containerRef, isOpen, () => {
        setIsOpen(false);
    });

    return (
        <BaseModal
            size="md"
            title={t("addIngredientModal.title")}
            onClose={onClose}
            // while the dropdown is open, its own Escape handler (usePopoverDismiss below) should close
            // just the dropdown - BaseModal's document-level listener is registered first (at mount) and
            // would otherwise fire first and close the whole modal on the same keypress
            closeOnEscape={wizard.step === "pick" ? !isOpen : true}
            footer={
                <AddIngredientModalFooter
                    step={wizard.step}
                    canContinue={wizard.newlySelected.length > 0}
                    isLastQuantityStep={wizard.isLastQuantityStep}
                    onCancel={onClose}
                    onContinue={wizard.startQuantities}
                    onBack={wizard.goBack}
                    onNext={wizard.goNext}
                />
            }
        >
            {wizard.step === "pick" ? (
                <AddIngredientPickerStep
                    containerRef={containerRef}
                    allIngredients={allIngredients}
                    personIngredients={personIngredients}
                    selectedIngredients={selectedIngredients}
                    newlySelected={wizard.newlySelected}
                    onToggle={onToggle}
                    isOpen={isOpen}
                    onOpenChange={setIsOpen}
                />
            ) : (
                currentIngredient && (
                    <AddIngredientQuantityStep
                        ingredient={currentIngredient}
                        quantity={wizard.quantityOf(currentIngredient.id)}
                        stepNumber={wizard.quantityIndex + 1}
                        stepCount={wizard.newlySelected.length}
                        onQuantityChange={(quantity) => {
                            wizard.setQuantity(currentIngredient.id, quantity);
                        }}
                    />
                )
            )}
        </BaseModal>
    );
};
