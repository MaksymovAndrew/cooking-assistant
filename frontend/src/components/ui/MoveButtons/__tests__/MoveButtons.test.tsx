import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import type { MoveDirection } from "types/reorder";

import { MoveButtons } from "components/ui/MoveButtons";

const NAMES = ["Oats", "Milk", "Honey"];

const OATS_UP = "Move Oats up";

const OATS_DOWN = "Move Oats down";

// a moved row is re-inserted into the DOM, which drops focus from the button inside it
const List = () => {
    const [names, setNames] = useState(NAMES);

    const move = (name: string, direction: MoveDirection) => {
        const from = names.indexOf(name);
        const next = names.filter((entry) => entry !== name);

        next.splice(from + direction, 0, name);
        setNames(next);
    };

    return (
        <ul>
            {names.map((name, index) => (
                <li key={name}>
                    <MoveButtons
                        name={name}
                        isFirst={index === 0}
                        isLast={index === names.length - 1}
                        onMove={(direction) => {
                            move(name, direction);
                        }}
                    />
                </li>
            ))}
        </ul>
    );
};

describe("MoveButtons", () => {
    it("should name the item each button moves", () => {
        render(
            <MoveButtons
                name="Oats"
                isFirst={false}
                isLast={false}
                onMove={jest.fn()}
            />,
        );

        expect(
            screen.getByRole("button", { name: OATS_UP }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: OATS_DOWN }),
        ).toBeInTheDocument();
    });

    it("should report the direction of the button pressed", async () => {
        const onMove = jest.fn();

        render(
            <MoveButtons
                name="Oats"
                isFirst={false}
                isLast={false}
                onMove={onMove}
            />,
        );

        await userEvent.click(screen.getByRole("button", { name: OATS_UP }));
        await userEvent.click(screen.getByRole("button", { name: OATS_DOWN }));

        expect(onMove.mock.calls).toEqual([[-1], [1]]);
    });

    it("should disable moving the first item up and the last item down", () => {
        render(<List />);

        expect(screen.getByRole("button", { name: OATS_UP })).toBeDisabled();
        expect(
            screen.getByRole("button", { name: "Move Honey down" }),
        ).toBeDisabled();
    });

    it("should keep focus on the pressed button after the row moves", async () => {
        render(<List />);

        await userEvent.click(screen.getByRole("button", { name: OATS_DOWN }));

        expect(screen.getByRole("button", { name: OATS_DOWN })).toHaveFocus();
    });

    it("should move focus to the other button once the row reaches the end", async () => {
        render(<List />);

        await userEvent.click(
            screen.getByRole("button", { name: "Move Milk up" }),
        );

        expect(
            screen.getByRole("button", { name: "Move Milk down" }),
        ).toHaveFocus();
    });

    it("should leave focus where the user moved it", async () => {
        render(
            <>
                <MoveButtons
                    name="Oats"
                    isFirst={false}
                    isLast={false}
                    onMove={jest.fn()}
                />
                <input aria-label="Elsewhere" />
            </>,
        );

        await userEvent.click(screen.getByRole("button", { name: OATS_UP }));
        await userEvent.click(
            screen.getByRole("textbox", { name: "Elsewhere" }),
        );

        expect(
            screen.getByRole("textbox", { name: "Elsewhere" }),
        ).toHaveFocus();
    });
});
