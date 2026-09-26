import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ContentLanguageSelect } from "components/forms/ContentLanguageSelect";

describe("ContentLanguageSelect", () => {
    it("should show the current language, each option named in itself", () => {
        render(
            <ContentLanguageSelect
                id="recipe-language"
                label="Recipe language"
                value="pl"
                onChange={jest.fn()}
            />,
        );

        expect(screen.getByLabelText("Recipe language")).toHaveValue("pl");
        expect(
            screen.getByRole("option", { name: "Українська" }),
        ).toHaveAttribute("lang", "uk");
    });

    it("should report the picked language", async () => {
        const onChange = jest.fn();

        render(
            <ContentLanguageSelect
                id="recipe-language"
                label="Recipe language"
                value="en"
                onChange={onChange}
            />,
        );

        await userEvent.selectOptions(
            screen.getByLabelText("Recipe language"),
            "ru",
        );

        expect(onChange).toHaveBeenCalledWith("ru");
    });
});
