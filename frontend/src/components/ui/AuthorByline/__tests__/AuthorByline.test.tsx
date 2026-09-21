import { render, screen } from "@testing-library/react";

import { AuthorByline } from "components/ui/AuthorByline";

import { TEST_AUTHOR } from "test/constants";

describe("AuthorByline", () => {
    it("should name the author by first name and surname initial only", () => {
        render(<AuthorByline author={TEST_AUTHOR} className="byline" />);

        expect(
            screen.getByText(
                `by ${TEST_AUTHOR.name} ${TEST_AUTHOR.surname_initial}.`,
            ),
        ).toBeInTheDocument();
    });

    it("should show the author's uploaded photo", () => {
        render(
            <AuthorByline
                author={{
                    ...TEST_AUTHOR,
                    avatar_photo_key: "0b8f5a3e-2c4d-4e6f-8a1b-3c5d7e9f1a2b",
                }}
                className="byline"
            />,
        );

        expect(screen.getByRole("presentation")).toBeInTheDocument();
    });
});
