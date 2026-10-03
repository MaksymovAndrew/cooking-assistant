import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";

import { APP_ROOT_ID, MAIN_CONTENT_ID } from "constants/landmarks";

import { useDialogFocus } from "hooks/useDialogFocus";

const Dialog = ({ onClose }: { onClose: () => void }) => {
    const ref = useRef<HTMLDivElement>(null);

    useDialogFocus(ref);

    return (
        <div ref={ref} role="dialog" aria-label="Dialog" tabIndex={-1}>
            <button onClick={onClose}>Close</button>
        </div>
    );
};

const Page = ({ removeOpenerOnClose = false, hasMain = true }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [hasOpener, setHasOpener] = useState(true);

    const close = () => {
        setIsOpen(false);
        setHasOpener(!removeOpenerOnClose);
    };

    return (
        <>
            <div id={APP_ROOT_ID} data-testid="app-root">
                {hasOpener && (
                    <button
                        onClick={() => {
                            setIsOpen(true);
                        }}
                    >
                        Open
                    </button>
                )}
                {hasMain && <main id={MAIN_CONTENT_ID} tabIndex={-1} />}
            </div>
            {isOpen && <Dialog onClose={close} />}
        </>
    );
};

const TwoDialogs = () => {
    const [isFirstOpen, setIsFirstOpen] = useState(true);

    return (
        <>
            <div id={APP_ROOT_ID} data-testid="app-root" />
            {isFirstOpen && (
                <Dialog
                    onClose={() => {
                        setIsFirstOpen(false);
                    }}
                />
            )}
            <Dialog onClose={jest.fn()} />
        </>
    );
};

describe("useDialogFocus", () => {
    it("should move focus onto the dialog when it opens", async () => {
        render(<Page />);

        await userEvent.click(screen.getByRole("button", { name: "Open" }));

        expect(screen.getByRole("dialog")).toHaveFocus();
    });

    it("should make the app root inert while the dialog is open", async () => {
        render(<Page />);

        const appRoot = screen.getByTestId("app-root");

        await userEvent.click(screen.getByRole("button", { name: "Open" }));

        expect(appRoot).toHaveAttribute("inert");

        await userEvent.click(screen.getByRole("button", { name: "Close" }));

        expect(appRoot).not.toHaveAttribute("inert");
    });

    it("should hand focus back to the opener when the dialog closes", async () => {
        render(<Page />);

        await userEvent.click(screen.getByRole("button", { name: "Open" }));
        await userEvent.click(screen.getByRole("button", { name: "Close" }));

        expect(screen.getByRole("button", { name: "Open" })).toHaveFocus();
    });

    it("should move focus to the main content when the opener is gone after closing", async () => {
        render(<Page removeOpenerOnClose />);

        await userEvent.click(screen.getByRole("button", { name: "Open" }));
        await userEvent.click(screen.getByRole("button", { name: "Close" }));

        expect(screen.getByRole("main")).toHaveFocus();
    });

    it("should leave focus alone when neither the opener nor the main content is there", async () => {
        render(<Page removeOpenerOnClose hasMain={false} />);

        await userEvent.click(screen.getByRole("button", { name: "Open" }));
        await userEvent.click(screen.getByRole("button", { name: "Close" }));

        expect(document.body).toHaveFocus();
    });

    it("should keep the app root inert while another dialog is still open", async () => {
        render(<TwoDialogs />);

        await userEvent.click(
            screen.getAllByRole("button", { name: "Close" })[0],
        );

        expect(screen.getAllByRole("dialog")).toHaveLength(1);
        expect(screen.getByTestId("app-root")).toHaveAttribute("inert");
    });
});
