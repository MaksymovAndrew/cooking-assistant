export type TokenPurpose = "password-reset" | "verify-email";

export interface TokenService {
    generate(id: number): string;
    // bindingSource ties the token to a piece of state so it stops verifying once that state changes
    generatePurposeToken(
        id: number,
        purpose: TokenPurpose,
        expiresInSeconds: number,
        bindingSource?: string,
    ): string;
    verifyPurposeToken(
        token: string,
        purpose: TokenPurpose,
        bindingSource?: string,
    ): number | null;
}
