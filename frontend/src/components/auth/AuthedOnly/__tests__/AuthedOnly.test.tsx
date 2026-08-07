import { screen } from "@testing-library/react";

import { AuthedOnly } from "components/auth/AuthedOnly";

import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

describe("AuthedOnly", () => {
    it("should render children when the viewer is authed", () => {
        renderWithProviders(
            <AuthedOnly>
                <span>Secret</span>
            </AuthedOnly>,
            { store: makeTestStore({ session: { status: "authed" } }) },
        );

        expect(screen.getByText("Secret")).toBeInTheDocument();
    });

    it("should render nothing when the viewer is a guest and no fallback is given", () => {
        renderWithProviders(
            <AuthedOnly>
                <span>Secret</span>
            </AuthedOnly>,
            { store: makeTestStore({ session: { status: "guest" } }) },
        );

        expect(screen.queryByText("Secret")).not.toBeInTheDocument();
    });

    it("should render the fallback when the viewer is a guest", () => {
        renderWithProviders(
            <AuthedOnly fallback={<span>Log in to see this</span>}>
                <span>Secret</span>
            </AuthedOnly>,
            { store: makeTestStore({ session: { status: "guest" } }) },
        );

        expect(screen.queryByText("Secret")).not.toBeInTheDocument();
        expect(screen.getByText("Log in to see this")).toBeInTheDocument();
    });
});
