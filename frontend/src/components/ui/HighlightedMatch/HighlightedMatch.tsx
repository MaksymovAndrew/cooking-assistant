import React from "react";

interface HighlightedMatchProps {
    text: string;
    query: string;
}

// bolds the first case-insensitive occurrence of query within text
export const HighlightedMatch: React.FC<HighlightedMatchProps> = ({
    text,
    query,
}) => {
    const index = text.toLowerCase().indexOf(query.trim().toLowerCase());

    if (index === -1) {
        return <>{text}</>;
    }

    const end = index + query.trim().length;

    return (
        <>
            {text.slice(0, index)}
            <strong>{text.slice(index, end)}</strong>
            {text.slice(end)}
        </>
    );
};
