import React from "react";

import { DonburiMarkDetailed, DonburiMarkStandard } from "components/icons";

import {
    bodyStyle,
    brandNameStyle,
    brandRowStyle,
    cardStyle,
    eyebrowStyle,
    factsStyle,
    factStyle,
    MARK_SIZE,
    subtitleStyle,
    titleStyle,
    WATERMARK_SIZE,
    watermarkStyle,
} from "./SocialCard.styles";

interface SocialCardProps {
    appName: string;
    eyebrow: string | null;
    title: string;
    subtitle: string | null;
    facts: string[];
}

// rendered to a PNG for link previews, never into the page: flexbox and inline styles only, and
// no client component - the renderer calls every component as a plain function
export const SocialCard: React.FC<SocialCardProps> = ({
    appName,
    eyebrow,
    title,
    subtitle,
    facts,
}) => (
    <div style={cardStyle}>
        <div style={watermarkStyle}>
            <DonburiMarkDetailed size={WATERMARK_SIZE} />
        </div>
        <div style={brandRowStyle}>
            <DonburiMarkStandard size={MARK_SIZE} />
            <span style={brandNameStyle}>{appName}</span>
        </div>
        <div style={bodyStyle}>
            {eyebrow && <span style={eyebrowStyle}>{eyebrow}</span>}
            <span style={titleStyle}>{title}</span>
            {subtitle && <span style={subtitleStyle}>{subtitle}</span>}
            {facts.length > 0 && (
                <div style={factsStyle}>
                    {facts.map((fact) => (
                        <span key={fact} style={factStyle}>
                            {fact}
                        </span>
                    ))}
                </div>
            )}
        </div>
    </div>
);
