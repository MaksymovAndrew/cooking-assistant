import React from "react";

interface JsonLdProps {
    data: object;
}

// "<" is escaped so a title containing "</script>" cannot end the tag and inject markup
export const JsonLd: React.FC<JsonLdProps> = ({ data }) => (
    <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
            __html: JSON.stringify(data).replace(/</g, "\\u003c"),
        }}
    />
);
