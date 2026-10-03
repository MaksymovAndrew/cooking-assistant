import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { CurrentUser } from "types/auth";

import { API_ROUTES } from "api/endpoints";

import { selectActiveModal } from "redux/selectors/uiSelectors";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { EditProfileModal } from "components/profile/EditProfileModal";

import { mockedPatch, mockedPut } from "test/apiClientMock";
import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

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
const MODAL_ID = "m1";

const renderOpen = () =>
    renderWithProviders(
        <EditProfileModal modalId={MODAL_ID} currentUser={CURRENT_USER} />,
        {
            store: makeTestStore({
                ui: {
                    queue: [
                        {
                            id: MODAL_ID,
                            type: MODAL_TYPE.editProfile,
                            currentUser: CURRENT_USER,
                        },
                    ],
                },
            }),
        },
    );

describe("EditProfileModal", () => {
    it("should prefill the fields and save the updated profile", async () => {
        mockedPatch.mockResolvedValue({ data: null });
        const { store } = renderOpen();

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
        expect(selectActiveModal(store.getState())).toBeNull();
    });

    it("should close the modal when Cancel is clicked", async () => {
        const { store } = renderOpen();

        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(selectActiveModal(store.getState())).toBeNull();
    });

    it("should show a required-fields error and not submit when the name is cleared", async () => {
        renderOpen();

        await userEvent.clear(screen.getByLabelText("Name"));
        await userEvent.click(screen.getByRole("button", { name: "Save" }));

        expect(mockedPatch).not.toHaveBeenCalled();
        expect(
            screen.getByText("Name and surname are required"),
        ).toBeInTheDocument();
    });

    it("should select the no-avatar option and submit avatar as null", async () => {
        mockedPatch.mockResolvedValue({ data: null });

        renderOpen();

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

        renderOpen();

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
