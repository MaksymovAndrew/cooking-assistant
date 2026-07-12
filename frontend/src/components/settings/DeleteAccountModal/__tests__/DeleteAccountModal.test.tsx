import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DeleteAccountModal } from "components/settings/DeleteAccountModal";

describe("DeleteAccountModal", () => {
    it("should render the warning title and message", () => {
        render(<DeleteAccountModal onClose={jest.fn()} />);

        expect(screen.getByText("Delete account?")).toBeInTheDocument();
    });

    it("should disable the confirm button", () => {
        render(<DeleteAccountModal onClose={jest.fn()} />);

        expect(
            screen.getByRole("button", { name: "Delete account" }),
        ).toBeDisabled();
    });

    it("should call onClose when Cancel is clicked", async () => {
        const onClose = jest.fn();

        render(<DeleteAccountModal onClose={onClose} />);

        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
