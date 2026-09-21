import { render, screen } from "@testing-library/react";

import { RecordPhoto } from "components/ui/RecordPhoto";

describe("RecordPhoto", () => {
    it("should render the photo as a decorative image", () => {
        render(<RecordPhoto src="blob:test/photo" fallback="no photo" />);

        expect(screen.getByRole("presentation")).toHaveAttribute(
            "src",
            "blob:test/photo",
        );
        expect(screen.queryByText("no photo")).not.toBeInTheDocument();
    });

    it("should render the fallback when there is no photo", () => {
        render(<RecordPhoto src={null} fallback="no photo" />);

        expect(screen.getByText("no photo")).toBeInTheDocument();
        expect(screen.queryByRole("presentation")).not.toBeInTheDocument();
    });
});
