import ResendEmailService from "infrastructure/email/ResendEmailService";

import { TEST_FRONTEND_ORIGIN } from "test/helpers/testConstants";

const TO = "user@example.com";
const LINK = `${TEST_FRONTEND_ORIGIN}/reset-password?token=abc`;
const API_KEY = "re_test_key";
const FROM = "noreply@example.com";
const RESEND_API_URL = "https://api.resend.com/emails";

describe("ResendEmailService", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should POST a password reset email to the Resend API", async () => {
        const fetchSpy = jest
            .spyOn(global, "fetch")
            .mockResolvedValue(new Response(null, { status: 200 }));
        const service = new ResendEmailService(API_KEY, FROM);

        await service.sendPasswordResetEmail(TO, LINK);

        expect(fetchSpy).toHaveBeenCalledTimes(1);
        const [url, init] = fetchSpy.mock.calls[0];
        const headers = init?.headers as Record<string, string>;

        expect(url).toBe(RESEND_API_URL);
        expect(init?.method).toBe("POST");
        expect(headers.Authorization).toBe(`Bearer ${API_KEY}`);

        const body = JSON.parse(init?.body as string) as {
            from: string;
            to: string;
            subject: string;
            html: string;
        };

        expect(body.from).toBe(FROM);
        expect(body.to).toBe(TO);
        expect(body.html).toContain(LINK);
    });

    it("should POST a verification email to the Resend API", async () => {
        const fetchSpy = jest
            .spyOn(global, "fetch")
            .mockResolvedValue(new Response(null, { status: 200 }));
        const service = new ResendEmailService(API_KEY, FROM);

        await service.sendVerificationEmail(TO, LINK);

        const [, init] = fetchSpy.mock.calls[0];
        const body = JSON.parse(init?.body as string) as {
            subject: string;
            html: string;
        };

        expect(body.subject).toBe("Verify your email");
        expect(body.html).toContain(LINK);
    });

    it("should throw when the Resend API responds with a non-ok status", async () => {
        jest.spyOn(global, "fetch").mockResolvedValue(
            new Response("bad request", { status: 422 }),
        );
        const service = new ResendEmailService(API_KEY, FROM);

        await expect(service.sendPasswordResetEmail(TO, LINK)).rejects.toThrow(
            "Failed to send email",
        );
    });
});
