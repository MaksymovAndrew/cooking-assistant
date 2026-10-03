import { rememberLoginRedirect, takeLoginRedirect } from "utils/loginRedirect";

import { setTestLocation } from "test/nextNavigationMock";

describe("loginRedirect", () => {
    it("should return the page the visitor was on, query included", () => {
        setTestLocation("/menu/9?portions=4");

        rememberLoginRedirect();

        expect(takeLoginRedirect()).toBe("/menu/9?portions=4");
    });

    it("should hand the target out only once", () => {
        setTestLocation("/menu/9");

        rememberLoginRedirect();
        takeLoginRedirect();

        expect(takeLoginRedirect()).toBeNull();
    });

    it("should not remember a sign-in page", () => {
        setTestLocation("/login");

        rememberLoginRedirect();

        expect(takeLoginRedirect()).toBeNull();
    });

    it("should not remember a sign-in page in another language", () => {
        setTestLocation("/uk/registration");

        rememberLoginRedirect();

        expect(takeLoginRedirect()).toBeNull();
    });

    it("should return nothing when nothing was remembered", () => {
        expect(takeLoginRedirect()).toBeNull();
    });

    it("should refuse a stored target that could leave the app", () => {
        sessionStorage.setItem("login-redirect", "//example.com/phish");

        expect(takeLoginRedirect()).toBeNull();
        expect(sessionStorage.getItem("login-redirect")).toBeNull();
    });
});
