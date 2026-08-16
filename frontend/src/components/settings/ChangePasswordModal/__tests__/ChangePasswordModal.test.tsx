import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ERROR_CODES } from "constants/errorCodes";

import { API_ROUTES } from "api/endpoints";

import { ChangePasswordModal } from "components/settings/ChangePasswordModal";

import { mockedPost } from "test/apiClientMock";
import { renderWithProviders } from "test/router";

jest.mock("api/client");

const CURRENT_PASSWORD = "old-secret";
const NEW_PASSWORD = "new-secret1!";

const fillAndSave = async (newPassword = NEW_PASSWORD) => {
    await userEvent.type(
        screen.getByLabelText("Current password"),
        CURRENT_PASSWORD,
    );
    await userEvent.type(screen.getByLabelText("New password"), NEW_PASSWORD);
    await userEvent.type(
        screen.getByLabelText("Confirm new password"),
        newPassword,
    );
    await userEvent.click(
        screen.getByRole("button", { name: "Save password" }),
    );
};

describe("ChangePasswordModal", () => {
    it("should change the password, notify and close on success", async () => {
        mockedPost.mockResolvedValue({ data: null });
        const onClose = jest.fn();
        const { store } = renderWithProviders(
            <ChangePasswordModal onClose={onClose} />,
        );

        await fillAndSave();

        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.auth.changePassword,
            { currentPassword: CURRENT_PASSWORD, newPassword: NEW_PASSWORD },
        );
        expect(store.getState().notifications.items).toEqual([
            expect.objectContaining({
                type: "success",
                message: "Password changed",
            }),
        ]);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should disable the submit button while the request is in flight", async () => {
        mockedPost.mockReturnValue(new Promise(() => undefined));

        renderWithProviders(<ChangePasswordModal onClose={jest.fn()} />);

        await fillAndSave();

        expect(screen.getByRole("button", { name: "Saving…" })).toBeDisabled();
    });

    it("should call onClose when Cancel is clicked", async () => {
        const onClose = jest.fn();

        renderWithProviders(<ChangePasswordModal onClose={onClose} />);

        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should show a required-fields error and not submit when a field is empty", async () => {
        renderWithProviders(<ChangePasswordModal onClose={jest.fn()} />);

        await userEvent.click(
            screen.getByRole("button", { name: "Save password" }),
        );

        expect(mockedPost).not.toHaveBeenCalled();
        expect(
            screen.getByText("Please fill in all fields."),
        ).toBeInTheDocument();
    });

    it("should show a mismatch error and not submit when passwords differ", async () => {
        renderWithProviders(<ChangePasswordModal onClose={jest.fn()} />);

        await fillAndSave("different-secret");

        expect(mockedPost).not.toHaveBeenCalled();
        expect(
            screen.getByText("New passwords do not match."),
        ).toBeInTheDocument();
    });

    it("should show the current-password-incorrect error and keep the modal open", async () => {
        mockedPost.mockRejectedValue({
            isAxiosError: true,
            response: {
                status: 401,
                data: {
                    error: "Current password is incorrect",
                    code: ERROR_CODES.CURRENT_PASSWORD_INCORRECT,
                },
            },
            message: "Request failed",
        });
        const onClose = jest.fn();

        renderWithProviders(<ChangePasswordModal onClose={onClose} />);

        await fillAndSave();

        expect(
            screen.getByText("Current password is incorrect."),
        ).toBeInTheDocument();
        expect(onClose).not.toHaveBeenCalled();
    });
});
