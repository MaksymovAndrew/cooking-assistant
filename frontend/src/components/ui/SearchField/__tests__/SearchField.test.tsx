import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SearchField } from "components/ui/SearchField";

const PLACEHOLDER = "Search by ingredient";
const QUERY = "egg";
const DEBOUNCE_MS = 300;

const setupUser = () =>
    userEvent.setup({
        advanceTimers: (ms) => {
            jest.advanceTimersByTime(ms);
        },
    });

describe("SearchField", () => {
    it("should update the input immediately while typing, before the debounce settles", async () => {
        jest.useFakeTimers();
        const user = setupUser();
        const onChange = jest.fn();

        try {
            render(
                <SearchField
                    placeholder={PLACEHOLDER}
                    value=""
                    onChange={onChange}
                />,
            );

            const input = screen.getByPlaceholderText(PLACEHOLDER);

            await user.type(input, QUERY);

            expect(input).toHaveValue(QUERY);
            expect(onChange).not.toHaveBeenCalled();
        } finally {
            jest.useRealTimers();
        }
    });

    it("should call onChange with the typed value once the debounce settles", async () => {
        jest.useFakeTimers();
        const user = setupUser();
        const onChange = jest.fn();

        try {
            render(
                <SearchField
                    placeholder={PLACEHOLDER}
                    value=""
                    onChange={onChange}
                />,
            );

            await user.type(screen.getByPlaceholderText(PLACEHOLDER), QUERY);
            act(() => {
                jest.advanceTimersByTime(DEBOUNCE_MS);
            });

            expect(onChange).toHaveBeenCalledWith(QUERY);
        } finally {
            jest.useRealTimers();
        }
    });

    it("should clear the input and call onChange immediately when the clear button is clicked", async () => {
        jest.useFakeTimers();
        const user = setupUser();
        const onChange = jest.fn();

        try {
            render(
                <SearchField
                    placeholder={PLACEHOLDER}
                    value=""
                    onChange={onChange}
                />,
            );

            const input = screen.getByPlaceholderText(PLACEHOLDER);

            await user.type(input, QUERY);
            await user.click(screen.getByRole("button", { name: "Clear" }));

            expect(input).toHaveValue("");
            expect(onChange).toHaveBeenLastCalledWith("");
            expect(
                screen.queryByRole("button", { name: "Clear" }),
            ).not.toBeInTheDocument();
        } finally {
            jest.useRealTimers();
        }
    });

    it("should resync the input when the committed value is cleared from outside", () => {
        const { rerender } = render(
            <SearchField
                placeholder={PLACEHOLDER}
                value={QUERY}
                onChange={jest.fn()}
            />,
        );

        const input = screen.getByPlaceholderText(PLACEHOLDER);

        expect(input).toHaveValue(QUERY);

        rerender(
            <SearchField
                placeholder={PLACEHOLDER}
                value=""
                onChange={jest.fn()}
            />,
        );

        expect(input).toHaveValue("");
    });

    it("should call onFocus when the input is focused", async () => {
        const onFocus = jest.fn();

        render(
            <SearchField
                placeholder={PLACEHOLDER}
                value=""
                onChange={jest.fn()}
                onFocus={onFocus}
            />,
        );

        await userEvent.click(screen.getByPlaceholderText(PLACEHOLDER));

        expect(onFocus).toHaveBeenCalledTimes(1);
    });
});
