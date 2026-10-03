"use client";

import { useServerInsertedHTML } from "next/navigation";
import { useRef } from "react";

import { themeInitScript } from "app/themeInit";

interface ThemeInitScriptProps {
    nonce: string | undefined;
}

// server HTML only: a script React creates on the client never runs, as on a 404's client render
export const ThemeInitScript = ({ nonce }: ThemeInitScriptProps) => {
    const isInserted = useRef(false);

    // asked again on every flush, but the head needs the script once
    useServerInsertedHTML(() => {
        if (isInserted.current) {
            return null;
        }

        isInserted.current = true;

        return (
            <script
                nonce={nonce}
                dangerouslySetInnerHTML={{ __html: themeInitScript }}
            />
        );
    });

    return null;
};
