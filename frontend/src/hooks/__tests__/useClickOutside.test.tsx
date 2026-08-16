import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";

import {
    CLICK_OUTSIDE_SAFE_ATTR,
    useClickOutside,
} from "hooks/useClickOutside";

const Probe = ({
    onOutside,
    enabled,
}: {
    onOutside: () => void;
    enabled?: boolean;
}) => {
    const ref = useRef<HTMLDivElement>(null);

    useClickOutside(ref, onOutside, enabled);

    return (
        <div>
            <div ref={ref}>
                <button>inside</button>
            </div>
            <button>outside</button>
            <button {...{ [CLICK_OUTSIDE_SAFE_ATTR]: "" }}>safe outside</button>
        </div>
    );
};

describe("useClickOutside", () => {
    it("should call the handler when a click lands outside the element", async () => {
        const onOutside = jest.fn();

        render(<Probe onOutside={onOutside} />);

        await userEvent.click(screen.getByRole("button", { name: "outside" }));

        expect(onOutside).toHaveBeenCalledTimes(1);
    });

    it("should not call the handler when the click is inside the element", async () => {
        const onOutside = jest.fn();

        render(<Probe onOutside={onOutside} />);

        await userEvent.click(screen.getByRole("button", { name: "inside" }));

        expect(onOutside).not.toHaveBeenCalled();
    });

    it("should not listen when disabled", async () => {
        const onOutside = jest.fn();

        render(<Probe onOutside={onOutside} enabled={false} />);

        await userEvent.click(screen.getByRole("button", { name: "outside" }));

        expect(onOutside).not.toHaveBeenCalled();
    });

    it("should not call the handler for a click on an element carrying the safe-click marker", async () => {
        const onOutside = jest.fn();

        render(<Probe onOutside={onOutside} />);

        await userEvent.click(
            screen.getByRole("button", { name: "safe outside" }),
        );

        expect(onOutside).not.toHaveBeenCalled();
    });
});
