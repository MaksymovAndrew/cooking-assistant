import { render, screen } from "@testing-library/react";

import { ConfirmModal } from "components/modals/ConfirmModal";

import { BTN_DELETE_RECIPE } from "test/constants";

const MESSAGE = "Are you sure you want to delete this recipe?";

describe("ConfirmModal", () => {
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
});
