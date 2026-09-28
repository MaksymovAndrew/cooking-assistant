export const CONTENT_SECURITY_POLICY_HEADER = "Content-Security-Policy";
// the layout reads the request's nonce from here for the one inline script it writes itself
export const NONCE_HEADER = "x-nonce";

interface ContentSecurityPolicyOptions {
    nonce: string;
    // where uploaded photos are served from; empty when they come through the same origin
    apiBaseUrl: string;
    // React's development build evaluates strings to rebuild call stacks
    allowEval: boolean;
}

export const createNonce = (): string => btoa(crypto.randomUUID());

export const buildContentSecurityPolicy = ({
    nonce,
    apiBaseUrl,
    allowEval,
}: ContentSecurityPolicyOptions): string => {
    const apiOrigin = apiBaseUrl ? new URL(apiBaseUrl).origin : "";
    const evalSource = allowEval ? " 'unsafe-eval'" : "";

    return [
        // strict-dynamic: a chunk loaded by a trusted script is trusted too, so no host list is needed
        `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${evalSource}`,
        "frame-ancestors 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        // blob: is the local preview of a photo before it is uploaded
        `img-src 'self' data: blob: ${apiOrigin}`.trim(),
    ].join("; ");
};
