import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { CurrentUser } from "types/auth";

import { API_ROUTES } from "api/endpoints";

import { EditProfileModal } from "components/profile/EditProfileModal";

import { mockedPatch, mockedPut } from "test/apiClientMock";
import { renderWithProviders } from "test/router";

jest.mock("api/client");

const CURRENT_USER: CurrentUser = {
    id: 1,
    name: "Claude",
    surname: "Cook",
    login: "claude",
    created_at: "2025-06-15T00:00:00.000Z",
    email: "claude@example.com",
    email_verified_at: null,
    avatar: "tomato",
    avatar_photo_key: null,
    calorie_goal: null,
    locale: "en",
};

describe("EditProfileModal", () => {
    it("should prefill the fields and save the updated profile", async () => {
        mockedPatch.mockResolvedValue({ data: null });
        const onClose = jest.fn();

        renderWithProviders(
            <EditProfileModal currentUser={CURRENT_USER} onClose={onClose} />,
        );

        expect(screen.getByLabelText("Name")).toHaveValue("Claude");
        expect(screen.getByLabelText("Surname")).toHaveValue("Cook");

        await userEvent.clear(screen.getByLabelText("Name"));
        await userEvent.type(screen.getByLabelText("Name"), "Claudia");
        await userEvent.click(screen.getByRole("radio", { name: "sushi" }));
        await userEvent.click(screen.getByRole("button", { name: "Save" }));

        expect(mockedPatch).toHaveBeenCalledWith(API_ROUTES.auth.me, {
            name: "Claudia",
            surname: "Cook",
            avatar: "sushi",
        });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should submit an edited surname", async () => {
        mockedPatch.mockResolvedValue({ data: null });

        renderWithProviders(
            <EditProfileModal currentUser={CURRENT_USER} onClose={jest.fn()} />,
        );

        await userEvent.clear(screen.getByLabelText("Surname"));
        await userEvent.type(screen.getByLabelText("Surname"), "Chef");
        await userEvent.click(screen.getByRole("button", { name: "Save" }));

        expect(mockedPatch).toHaveBeenCalledWith(API_ROUTES.auth.me, {
            name: "Claude",
            surname: "Chef",
            avatar: "tomato",
        });
    });

    it("should call onClose when Cancel is clicked", async () => {
        const onClose = jest.fn();

        renderWithProviders(
            <EditProfileModal currentUser={CURRENT_USER} onClose={onClose} />,
        );

        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("should show a required-fields error and not submit when the name is cleared", async () => {
        renderWithProviders(
            <EditProfileModal currentUser={CURRENT_USER} onClose={jest.fn()} />,
        );

        await userEvent.clear(screen.getByLabelText("Name"));
        await userEvent.click(screen.getByRole("button", { name: "Save" }));

        expect(mockedPatch).not.toHaveBeenCalled();
        expect(
            screen.getByText("Name and surname are required"),
        ).toBeInTheDocument();
    });

    it("should select the no-avatar option and submit avatar as null", async () => {
        mockedPatch.mockResolvedValue({ data: null });

        renderWithProviders(
            <EditProfileModal currentUser={CURRENT_USER} onClose={jest.fn()} />,
        );

        await userEvent.click(screen.getByRole("radio", { name: "No avatar" }));
        await userEvent.click(screen.getByRole("button", { name: "Save" }));

        expect(mockedPatch).toHaveBeenCalledWith(API_ROUTES.auth.me, {
            name: "Claude",
            surname: "Cook",
            avatar: null,
        });
    });

    it("should upload a picked photo on save and note that it replaces the avatar", async () => {
        mockedPatch.mockResolvedValue({ data: null });
        mockedPut.mockResolvedValue({
            data: { photo_key: "0b8f5a3e-2c4d-4e6f-8a1b-3c5d7e9f1a2b" },
        });
        const photo = new File(["image"], "me.png", { type: "image/png" });

        renderWithProviders(
            <EditProfileModal currentUser={CURRENT_USER} onClose={jest.fn()} />,
        );

        expect(
            screen.queryByText("Your photo is shown instead of the avatar."),
        ).not.toBeInTheDocument();

        await userEvent.upload(screen.getByTestId("photo-input"), photo);

        expect(screen.getByAltText("Your profile photo")).toBeInTheDocument();
        expect(
            screen.getByText("Your photo is shown instead of the avatar."),
        ).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", { name: "Save" }));

        expect(mockedPut).toHaveBeenCalledWith(API_ROUTES.auth.avatar, photo);
    });
});
