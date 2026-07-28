import { z } from "zod";

export interface CalorieOverride {
    kcalPer100: number;
    confidence: "sourced" | "estimated";
}

export interface TranslationOverride {
    ru?: string;
    uk?: string;
    pl?: string;
}

const calorieOverrideSchema = z.object({
    kcalPer100: z.number().min(0),
    confidence: z.enum(["sourced", "estimated"]),
});

const translationOverrideSchema = z.object({
    ru: z.string().min(1).optional(),
    uk: z.string().min(1).optional(),
    pl: z.string().min(1).optional(),
});

// slug -> override; both JSON files are hand-authored, so a typo'd field or invalid value fails loudly here instead of silently resolving to undefined
export function parseCalorieOverrides(
    raw: unknown,
): Partial<Record<string, CalorieOverride>> {
    return z.record(z.string(), calorieOverrideSchema).parse(raw);
}

export function parseTranslationOverrides(
    raw: unknown,
): Partial<Record<string, TranslationOverride>> {
    return z.record(z.string(), translationOverrideSchema).parse(raw);
}
