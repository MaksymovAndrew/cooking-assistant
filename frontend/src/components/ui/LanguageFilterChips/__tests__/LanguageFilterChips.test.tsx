import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { LanguageFilterChips } from "components/ui/LanguageFilterChips";

describe("LanguageFilterChips", () => {
    it("should name every language in itself", () => {
        render(<LanguageFilterChips value={[]} onChange={jest.fn()} />);

        expect(
            screen.getAllByRole("checkbox").map((chip) => chip.textContent),
        ).toEqual(["English", "Polski", "Русский", "Українська"]);
    });

    it("should add a picked language to the selection", async () => {
        const onChange = jest.fn();

        render(<LanguageFilterChips value={["en"]} onChange={onChange} />);

        await userEvent.click(screen.getByRole("checkbox", { name: "Polski" }));

        expect(onChange).toHaveBeenCalledWith(["en", "pl"]);
    });
});
