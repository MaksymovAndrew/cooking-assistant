import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CookingTimeField } from "components/recipes/CookingTimeField";

import { ERROR_COOKING_TIME_FORMAT, LABEL_COOKING_TIME } from "test/constants";

const FORMAT_HINT = "Hours & minutes";

const baseProps = {
    id: "cooking-time",
    label: LABEL_COOKING_TIME,
    hours: "",
    minutes: "",
    onHoursChange: jest.fn(),
    onMinutesChange: jest.fn(),
};

describe("CookingTimeField", () => {
    it("should show the format hint only while the field has no error", () => {
        const { rerender } = render(
            <CookingTimeField {...baseProps} error={null} />,
        );

        expect(screen.getByText(FORMAT_HINT)).toBeInTheDocument();

        rerender(
            <CookingTimeField
                {...baseProps}
                error={ERROR_COOKING_TIME_FORMAT}
            />,
        );

        expect(screen.queryByText(FORMAT_HINT)).not.toBeInTheDocument();
    });

    it("should report typed hours and minutes through their own callbacks", async () => {
        const onHoursChange = jest.fn();
        const onMinutesChange = jest.fn();

        render(
            <CookingTimeField
                {...baseProps}
                error={null}
                onHoursChange={onHoursChange}
                onMinutesChange={onMinutesChange}
            />,
        );

        await userEvent.type(screen.getByLabelText(LABEL_COOKING_TIME), "2");
        await userEvent.type(screen.getByLabelText("Minutes"), "5");

        expect(onHoursChange).toHaveBeenCalledWith("2");
        expect(onMinutesChange).toHaveBeenCalledWith("5");
    });
});
