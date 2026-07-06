import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { API_ROUTES } from "api/endpoints";

import { MODAL_TYPE } from "redux/slices/uiSlice";

import SettingsPage from "pages/settings/SettingsPage";
import { mockGetByUrl } from "test/apiClientMock";
import { renderWithProviders } from "test/router";

jest.mock("api/client");

const setup = () => {
    mockGetByUrl({ [API_ROUTES.auth.me]: null });

    return renderWithProviders(<SettingsPage />);
};

describe("SettingsPage", () => {
    it("should render the settings heading", () => {
        setup();

        expect(
            screen.getByRole("heading", { name: "Settings" }),
        ).toBeInTheDocument();
    });

    it("should open the theme-change confirmation when a different theme is selected", async () => {
        const { store } = setup();

        await userEvent.click(screen.getByRole("radio", { name: "Light" }));

        expect(store.getState().ui.modal?.type).toBe(MODAL_TYPE.themeChange);
    });

    it("should not open a confirmation when the current theme is re-selected", async () => {
        const { store } = setup();

        const currentMode = store.getState().theme.mode;
        const sameLabel = currentMode === "dark" ? "Dark" : "Light";

        await userEvent.click(screen.getByRole("radio", { name: sameLabel }));

        expect(store.getState().ui.modal).toBeNull();
    });

    it("should open and close the change-password modal", async () => {
        setup();

        await userEvent.click(screen.getByRole("button", { name: "Change" }));

        expect(
            screen.getByRole("heading", { name: "Change password" }),
        ).toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(
            screen.queryByRole("heading", { name: "Change password" }),
        ).not.toBeInTheDocument();
    });

    it("should open the delete-account modal", async () => {
        setup();

        await userEvent.click(screen.getByRole("button", { name: "Delete…" }));

        expect(screen.getByText("Delete account?")).toBeInTheDocument();
    });
});
