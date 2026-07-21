import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import { RouteErrorBoundary } from "components/layout/RouteErrorBoundary";

const ThrowingComponent = () => {
    throw new Error("boom");
};

// isRouteErrorResponse duck-types on {status, statusText, internal, data} - decorating a real Error satisfies both that check and the "always throw an Error" lint rule
const ThrowingResponseComponent = () => {
    throw Object.assign(new Error("Not Found"), {
        status: 404,
        statusText: "Not Found",
        internal: false,
        data: "Not Found",
    });
};

describe("RouteErrorBoundary", () => {
    it("should render a generic error message for a thrown JS error", () => {
        const router = createMemoryRouter(
            [
                {
                    path: "/",
                    element: <ThrowingComponent />,
                    errorElement: <RouteErrorBoundary />,
                },
            ],
            { initialEntries: ["/"] },
        );

        render(<RouterProvider router={router} />);

        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Try again" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "Go to homepage" }),
        ).toBeInTheDocument();
    });

    it("should render a status-aware message for a route error response", () => {
        const router = createMemoryRouter(
            [
                {
                    path: "/",
                    element: <ThrowingResponseComponent />,
                    errorElement: <RouteErrorBoundary />,
                },
            ],
            { initialEntries: ["/"] },
        );

        render(<RouterProvider router={router} />);

        expect(
            screen.getByText(/ran into an error \(404\)/),
        ).toBeInTheDocument();
    });
});
