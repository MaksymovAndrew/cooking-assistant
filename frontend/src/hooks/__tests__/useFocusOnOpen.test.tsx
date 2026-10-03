import { render, screen } from "@testing-library/react";
import { useRef } from "react";

import { useFocusOnOpen } from "hooks/useFocusOnOpen";

const Probe = ({ isOpen }: { isOpen: boolean }) => {
    const ref = useRef<HTMLButtonElement>(null);

    useFocusOnOpen(ref, isOpen);

    return <button ref={ref}>target</button>;
};

describe("useFocusOnOpen", () => {
    it("should leave focus where it is while closed", () => {
        render(<Probe isOpen={false} />);

        expect(
            screen.getByRole("button", { name: "target" }),
        ).not.toHaveFocus();
    });

    it("should move focus to the target once it opens", () => {
        const { rerender } = render(<Probe isOpen={false} />);

        rerender(<Probe isOpen />);

        expect(screen.getByRole("button", { name: "target" })).toHaveFocus();
    });
});
