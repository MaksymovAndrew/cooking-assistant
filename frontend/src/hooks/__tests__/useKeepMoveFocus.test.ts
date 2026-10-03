import { renderHook } from "@testing-library/react";

import { useKeepMoveFocus } from "hooks/useKeepMoveFocus";

const setup = () => {
    const up = document.createElement("button");
    const down = document.createElement("button");
    const elsewhere = document.createElement("input");

    document.body.append(up, down, elsewhere);

    const view = renderHook(() => {
        const mover = useKeepMoveFocus();

        mover.upRef.current = up;
        mover.downRef.current = down;

        return mover;
    });

    return { up, down, elsewhere, ...view };
};

afterEach(() => {
    document.body.replaceChildren();
});

describe("useKeepMoveFocus", () => {
    it("should put focus back on the pressed button after the row moves", () => {
        const { down, result, rerender } = setup();

        down.focus();
        result.current.remember(1);
        // the re-inserted row has dropped focus to the body
        down.blur();
        rerender();

        expect(down).toHaveFocus();
    });

    it("should move focus to the other button once the pressed one is disabled", () => {
        const { up, down, result, rerender } = setup();

        up.focus();
        result.current.remember(-1);
        up.disabled = true;
        rerender();

        expect(down).toHaveFocus();
    });

    it("should not steal focus the user has moved elsewhere", () => {
        const { elsewhere, result, rerender } = setup();

        result.current.remember(1);
        elsewhere.focus();
        rerender();

        expect(elsewhere).toHaveFocus();
    });

    it("should do nothing on a render no press caused", () => {
        const { up, down, rerender } = setup();

        rerender();

        expect(up).not.toHaveFocus();
        expect(down).not.toHaveFocus();
    });
});
