import type { Request } from "express";

import { requestBody } from "controller/requestBody";

function withBody(body: unknown): Request {
    return Object.assign({} as Request, { body });
}

describe("requestBody", () => {
    it("should return the fields of a JSON object body", () => {
        expect(requestBody(withBody({ quantity: 4 }))).toEqual({
            quantity: 4,
        });
    });

    it.each([[undefined], [null], [[1, 2]], ["text"], [7]])(
        "should treat a %p body as no fields at all",
        (body) => {
            expect(requestBody(withBody(body))).toEqual({});
        },
    );
});
