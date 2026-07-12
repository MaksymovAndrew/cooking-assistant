import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ConfirmModal } from "components/modals/ConfirmModal";

import { BTN_DELETE_RECIPE } from "test/constants";

const MESSAGE = "Are you sure you want to delete this recipe?";

describe("ConfirmModal", () => {
    it("should show the title and message", () => {
        render(
            <ConfirmModal
                title={BTN_DELETE_RECIPE}
                message={MESSAGE}
                onClose={jest.fn()}
                onConfirm={jest.fn()}
            />,
        );

        expect(screen.getByText(BTN_DELETE_RECIPE)).toBeInTheDocument();
        expect(screen.getByText(MESSAGE)).toBeInTheDocument();
    });

    it("should use the default Cancel/Delete labels", () => {
        render(
            <ConfirmModal
                title={BTN_DELETE_RECIPE}
                message={MESSAGE}
                onClose={jest.fn()}
                onConfirm={jest.fn()}
            />,
        );

        expect(
            screen.getByRole("button", { name: "Cancel" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Delete" }),
        ).toBeInTheDocument();
    });

    it("should use custom confirm/cancel labels when given", () => {
        render(
            <ConfirmModal
                title={BTN_DELETE_RECIPE}
                message={MESSAGE}
                onClose={jest.fn()}
                onConfirm={jest.fn()}
                confirmLabel="Confirm"
                cancelLabel="Cancel"
            />,
        );

        expect(
            screen.getByRole("button", { name: "Confirm" }),
        ).toBeInTheDocument();
    });

    it("should render the error when provided", () => {
        render(
            <ConfirmModal
                title={BTN_DELETE_RECIPE}
                message={MESSAGE}
                onClose={jest.fn()}
                onConfirm={jest.fn()}
                error="Something went wrong"
            />,
        );

        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    });

    it("should disable the confirm button when isConfirmDisabled is true", () => {
        render(
            <ConfirmModal
                title={BTN_DELETE_RECIPE}
                message={MESSAGE}
                onClose={jest.fn()}
                onConfirm={jest.fn()}
                isConfirmDisabled
            />,
        );

        expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
    });

    it("should apply the primary variant class to the confirm button when requested", () => {
        render(
            <ConfirmModal
                title={BTN_DELETE_RECIPE}
                message={MESSAGE}
                onClose={jest.fn()}
                onConfirm={jest.fn()}
                confirmVariant="primary"
                confirmLabel="Log out"
            />,
        );

        expect(screen.getByRole("button", { name: "Log out" })).toHaveClass(
            "button--primary",
        );
    });

    it("should call onConfirm and onClose when their buttons are clicked", async () => {
        const onConfirm = jest.fn();
        const onClose = jest.fn();

        render(
            <ConfirmModal
                title={BTN_DELETE_RECIPE}
                message={MESSAGE}
                onClose={onClose}
                onConfirm={onConfirm}
            />,
        );

        await userEvent.click(screen.getByRole("button", { name: "Delete" }));
        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(onConfirm).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
