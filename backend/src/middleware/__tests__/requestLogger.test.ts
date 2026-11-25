import { serializeRequest, serializeResponse } from "middleware/requestLogger";

const CLIENT_IP = "203.0.113.77";
const CLIENT_NETWORK = "203.0.113.0";

const REQUEST = {
    id: "edge-42",
    method: "GET",
    url: "/api/me",
    headers: {
        "user-agent": "jest",
        "x-forwarded-for": CLIENT_IP,
        cookie: "authToken=secret",
        authorization: "Bearer secret",
        accept: "application/json",
    },
    raw: { ip: CLIENT_IP },
};

describe("request log serializers", () => {
    it("should keep the id, method, url, user agent and masked client network of a request", () => {
        expect(serializeRequest(REQUEST)).toEqual({
            id: "edge-42",
            method: "GET",
            url: "/api/me",
            client: CLIENT_NETWORK,
            headers: { "user-agent": "jest" },
        });
    });

    it("should never log the whole client address", () => {
        const line = JSON.stringify(serializeRequest(REQUEST));

        expect(line).not.toContain(CLIENT_IP);
        expect(line).toContain(CLIENT_NETWORK);
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
