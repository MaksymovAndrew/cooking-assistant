export type ShareOutcome = "shared" | "copied" | "cancelled" | "failed";

export interface ShareTarget {
    title: string;
    url: string;
}

// both are missing on some browsers (no Web Share on desktop Firefox, no clipboard over plain http)
export interface ShareCapabilities {
    share?: (data: ShareData) => Promise<void>;
    clipboard?: Pick<Clipboard, "writeText">;
}

const isAbort = (error: unknown) =>
    error instanceof DOMException && error.name === "AbortError";

const copyLink = async (
    url: string,
    clipboard: ShareCapabilities["clipboard"],
): Promise<ShareOutcome> => {
    if (!clipboard) {
        return "failed";
    }

    try {
        await clipboard.writeText(url);

        return "copied";
    } catch {
        return "failed";
    }
};

export const shareLink = async (
    target: ShareTarget,
    capabilities: ShareCapabilities,
): Promise<ShareOutcome> => {
    if (!capabilities.share) {
        return copyLink(target.url, capabilities.clipboard);
    }

    try {
        await capabilities.share({ title: target.title, url: target.url });

        return "shared";
    } catch (error) {
        return isAbort(error)
            ? "cancelled"
            : copyLink(target.url, capabilities.clipboard);
    }
};
