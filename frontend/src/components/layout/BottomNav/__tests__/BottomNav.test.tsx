import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

import { BottomNav } from "components/layout/BottomNav";

import type { LoginRedirectState } from "utils/loginRedirect";

import { renderWithProviders, renderWithRouter } from "test/router";
import { makeTestStore } from "test/store";

describe("BottomNav", () => {
    it("should render all 5 tabs in the Stats, Menus, Recipes, Ingredients, Profile order", () => {
        renderWithRouter(<BottomNav />);

        expect(
            screen.getAllByRole("link").map((link) => link.textContent),
        ).toEqual(["Stats", "Menus", "Recipes", "Ingredients", "Profile"]);
    });

    it("should mark the tab matching the current route as active", () => {
        renderWithRouter(<BottomNav />, ["/stats"]);

        expect(screen.getByRole("link", { name: /Stats/ })).toHaveClass(
            "bottom-nav__item--active",
        );
        expect(screen.getByRole("link", { name: /Menus/ })).not.toHaveClass(
            "bottom-nav__item--active",
        );
    });

    it("should render only 3 tabs (Recipes, Menus, Log In) for a guest", () => {
        renderWithProviders(<BottomNav />, {
            store: makeTestStore({ session: { status: "guest" } }),
        });

        expect(
            screen.getAllByRole("link").map((link) => link.textContent),
        ).toEqual(["Recipes", "Menus", "Log In"]);
    });

    it("should carry the current page as router state on the guest's Log In tab", async () => {
        function LoginPageStub() {
            const location = useLocation();
            const state = location.state as LoginRedirectState | null;

            return <div>login-from:{state?.from?.pathname ?? "none"}</div>;
        }

        render(
            <Provider store={makeTestStore({ session: { status: "guest" } })}>
                <MemoryRouter initialEntries={["/all-recipes"]}>
                    <Routes>
                        <Route path="/all-recipes" element={<BottomNav />} />
                        <Route path="/login" element={<LoginPageStub />} />
                    </Routes>
                </MemoryRouter>
            </Provider>,
        );

        await userEvent.click(screen.getByRole("link", { name: /Log In/ }));

        expect(
            await screen.findByText("login-from:/all-recipes"),
        ).toBeInTheDocument();
    });
});
