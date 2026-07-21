import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { OfflineModal } from "components/connectivity/OfflineModal";

const TITLE = "No internet connection";

const setNavigatorOnLine = (value: boolean) => {
    Object.defineProperty(navigator, "onLine", {
        configurable: true,
        value,
    });
};

const goOffline = () => {
    act(() => {
        window.dispatchEvent(new Event("offline"));
    });
};

const goOnline = () => {
    act(() => {
        window.dispatchEvent(new Event("online"));
    });
};

describe("OfflineModal", () => {
    afterEach(() => {
        setNavigatorOnLine(true);
    });

    it("should render nothing while online", () => {
        render(<OfflineModal />);

        expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
    });

    it("should show when the app starts offline", () => {
        setNavigatorOnLine(false);

        render(<OfflineModal />);

        expect(screen.getByText(TITLE)).toBeInTheDocument();
    });

    it("should show when connectivity drops after mounting online", () => {
        render(<OfflineModal />);

        goOffline();

        expect(screen.getByText(TITLE)).toBeInTheDocument();
    });

    it("should dismiss on close and not reappear while still offline", async () => {
        render(<OfflineModal />);

        goOffline();
        await userEvent.click(screen.getByRole("button", { name: "Close" }));

        expect(screen.queryByText(TITLE)).not.toBeInTheDocument();

        goOffline();

        expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
    });

    it("should auto-close when connectivity returns", () => {
        render(<OfflineModal />);

        goOffline();
        expect(screen.getByText(TITLE)).toBeInTheDocument();

        goOnline();

        expect(screen.queryByText(TITLE)).not.toBeInTheDocument();
    });

    it("should show again on a fresh offline transition after a previous dismiss", async () => {
        render(<OfflineModal />);

        goOffline();
        await userEvent.click(screen.getByRole("button", { name: "Close" }));
        goOnline();
        goOffline();

        expect(screen.getByText(TITLE)).toBeInTheDocument();
    });
});
