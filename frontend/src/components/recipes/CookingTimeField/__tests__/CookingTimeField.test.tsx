import { render, screen } from "@testing-library/react";

import { CookingTimeField } from "components/recipes/CookingTimeField";

import { ERROR_COOKING_TIME_FORMAT, LABEL_COOKING_TIME } from "test/constants";

describe("CookingTimeField", () => {
    it("should render label, hours/minutes inputs and no error when error is null", () => {
        render(
            <CookingTimeField
                id="cooking-time"
                label={LABEL_COOKING_TIME}
                hours="1"
                minutes="30"
                error={null}
                onHoursChange={jest.fn()}
                onMinutesChange={jest.fn()}
            />,
        );

        expect(screen.getByLabelText(LABEL_COOKING_TIME)).toHaveValue(1);
        expect(screen.queryByText(/error/)).toBeNull();
    });

    it("should render error message when provided", () => {
        render(
            <CookingTimeField
                id="cooking-time"
                label={LABEL_COOKING_TIME}
                hours=""
                minutes=""
                error={ERROR_COOKING_TIME_FORMAT}
                onHoursChange={jest.fn()}
                onMinutesChange={jest.fn()}
            />,
        );

        expect(screen.getByText(ERROR_COOKING_TIME_FORMAT)).toBeInTheDocument();
    });
});
