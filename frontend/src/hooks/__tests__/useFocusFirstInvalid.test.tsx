import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import { useFocusFirstInvalid } from "hooks/useFocusFirstInvalid";

// the errors and the focus request land in the same handler, as in a real failed submit
const SubmitHarness = ({ failing }: { failing: boolean }) => {
    const [submitted, setSubmitted] = useState(false);
    const { attachForm, focusFirstInvalid } = useFocusFirstInvalid();
    const isInvalid = submitted && failing;

    return (
        <form ref={attachForm}>
            <input aria-label="Title" />
            <input aria-label="Time" aria-invalid={isInvalid || undefined} />
            <input aria-label="Notes" aria-invalid={isInvalid || undefined} />
            <button
                type="button"
                onClick={() => {
                    setSubmitted(true);
                    focusFirstInvalid();
                }}
            >
                Save
            </button>
        </form>
    );
};

describe("useFocusFirstInvalid", () => {
    it("should focus the first field the failed submit flagged", async () => {
        render(<SubmitHarness failing />);

        await userEvent.click(screen.getByRole("button", { name: "Save" }));

        expect(screen.getByLabelText("Time")).toHaveFocus();
    });

    it("should focus it again on a repeated failed submit", async () => {
        render(<SubmitHarness failing />);

        await userEvent.click(screen.getByRole("button", { name: "Save" }));
        await userEvent.click(screen.getByLabelText("Title"));
        await userEvent.click(screen.getByRole("button", { name: "Save" }));

        expect(screen.getByLabelText("Time")).toHaveFocus();
    });

    it("should leave focus alone when nothing is invalid", async () => {
        render(<SubmitHarness failing={false} />);

        await userEvent.click(screen.getByRole("button", { name: "Save" }));

        expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
    });

    it("should not move focus before any submit", () => {
        render(<SubmitHarness failing />);

        expect(screen.getByLabelText("Time")).not.toHaveFocus();
    });
});
