import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ChangePasswordModal } from "components/settings/ChangePasswordModal";

describe("ChangePasswordModal", () => {
    it("should render the password fields, all disabled", () => {
        render(<ChangePasswordModal onClose={jest.fn()} />);

        expect(screen.getByLabelText("Current password")).toBeDisabled();
        expect(screen.getByLabelText("New password")).toBeDisabled();
        expect(screen.getByLabelText("Confirm new password")).toBeDisabled();
    });

    it("should disable the save button", () => {
        render(<ChangePasswordModal onClose={jest.fn()} />);

        expect(
            screen.getByRole("button", { name: "Save password" }),
        ).toBeDisabled();
    });

    it("should call onClose when Cancel is clicked", async () => {
        const onClose = jest.fn();

        render(<ChangePasswordModal onClose={onClose} />);

        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
