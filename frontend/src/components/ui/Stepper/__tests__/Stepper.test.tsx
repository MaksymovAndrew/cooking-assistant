import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Stepper } from "components/ui/Stepper";

describe("Stepper", () => {
    it("should display the current value", () => {
        render(
            <Stepper
                value={4}
                onChange={jest.fn()}
                decrementLabel="Decrease portions"
                incrementLabel="Increase portions"
            />,
        );

        expect(screen.getByText("4")).toBeInTheDocument();
    });

    it("should call onChange with value + step when incremented", async () => {
        const onChange = jest.fn();

        render(
            <Stepper
                value={4}
                onChange={onChange}
                decrementLabel="Decrease portions"
                incrementLabel="Increase portions"
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Increase portions" }),
        );

        expect(onChange).toHaveBeenCalledWith(5);
    });

    it("should call onChange with value - step when decremented", async () => {
        const onChange = jest.fn();

        render(
            <Stepper
                value={4}
                onChange={onChange}
                decrementLabel="Decrease portions"
                incrementLabel="Increase portions"
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Decrease portions" }),
        );

        expect(onChange).toHaveBeenCalledWith(3);
    });

    it("should disable the decrement button at the min value", () => {
        render(
            <Stepper
                value={1}
                min={1}
                onChange={jest.fn()}
                decrementLabel="Decrease portions"
                incrementLabel="Increase portions"
            />,
        );

        expect(
            screen.getByRole("button", { name: "Decrease portions" }),
        ).toBeDisabled();
    });

    it("should disable the increment button at the max value", () => {
        render(
            <Stepper
                value={10}
                max={10}
                onChange={jest.fn()}
                decrementLabel="Decrease portions"
                incrementLabel="Increase portions"
            />,
        );

        expect(
            screen.getByRole("button", { name: "Increase portions" }),
        ).toBeDisabled();
    });
});
