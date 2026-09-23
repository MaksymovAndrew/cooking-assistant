import { render } from "@testing-library/react";

import { JsonLd } from "components/seo/JsonLd";

const DATA = { "@type": "Recipe", name: "Borscht</script><script>alert(1)" };

describe("JsonLd", () => {
    it("should carry the data as parseable JSON", () => {
        const { container } = render(<JsonLd data={DATA} />);

        expect(JSON.parse(container.textContent)).toEqual(DATA);
    });

    it("should never let a value close the script tag", () => {
        const { container } = render(<JsonLd data={DATA} />);

        expect(container.textContent).not.toContain("</script>");
        expect(container.textContent).toContain("\\u003c/script>");
    });
});
