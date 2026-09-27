import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RegisterLanguageField } from "components/forms/auth/RegisterLanguageField";

import { loadPage } from "utils/reloadPage";

import { renderWithRouter } from "test/router";

jest.mock("utils/reloadPage");

const FIELD_LABEL = "Language · Język · Язык · Мова";

describe("RegisterLanguageField", () => {
    afterEach(() => {
        document.cookie = "NEXT_LOCALE=; Path=/; Max-Age=0";
    });

    it("should be labelled in every language", () => {
        renderWithRouter(<RegisterLanguageField />);

        expect(screen.getByLabelText(FIELD_LABEL)).toHaveValue("en");
    });

    it("should list each language by its own name", () => {
        renderWithRouter(<RegisterLanguageField />);

        expect(
            screen.getByRole("option", { name: "Українська" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("option", { name: "Polski" }),
        ).toBeInTheDocument();
    });

    it("should reload the page in the chosen language", async () => {
        renderWithRouter(<RegisterLanguageField />, ["/registration"]);

        await userEvent.selectOptions(screen.getByLabelText(FIELD_LABEL), "pl");

        expect(jest.mocked(loadPage)).toHaveBeenCalledWith("/pl/registration");
    });
});
