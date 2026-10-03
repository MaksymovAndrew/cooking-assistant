import { serializeRequest, serializeResponse } from "middleware/requestLogger";

const REQUEST = {
    id: "edge-42",
    method: "GET",
    url: "/api/me",
    headers: {
        "user-agent": "jest",
        "x-forwarded-for": "203.0.113.5",
        cookie: "authToken=secret",
        authorization: "Bearer secret",
        accept: "application/json",
    },
};

describe("request log serializers", () => {
    it("should keep the id, method, url, user agent and forwarded address of a request", () => {
        expect(serializeRequest(REQUEST)).toEqual({
            id: "edge-42",
            method: "GET",
            url: "/api/me",
            headers: {
                "user-agent": "jest",
                "x-forwarded-for": "203.0.113.5",
            },
        });
    });

    it("should never log the session cookie or an authorization header", () => {
        const line = JSON.stringify(serializeRequest(REQUEST));

        expect(line).not.toContain("secret");
    });

    it("should leave out a header the request did not send", () => {
        const { headers } = serializeRequest({
            ...REQUEST,
            headers: { "user-agent": "jest" },
        });

        expect(headers).toEqual({ "user-agent": "jest" });
    });

    it("should log only the status of a response, without its headers", () => {
        const response = {
            statusCode: 200,
            headers: { "set-cookie": "authToken=secret" },
        };

        expect(serializeResponse(response)).toEqual({ statusCode: 200 });
    });
});
