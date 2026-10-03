import {
    type CalorieTone,
    calorieToneFor,
    computeCalorieSummary,
} from "utils/computeCalorieSummary";
import type { DailyIntakeDay } from "utils/computeDailyIntake";
import { formatDate } from "utils/intlFormat";

const PERCENT_MULTIPLIER = 100;

const WEEKDAY_OPTIONS: Intl.DateTimeFormatOptions = { weekday: "short" };

const DAY_NAME_OPTIONS: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
};

// "2026-01-14" read as a local calendar day - new Date() would take it as UTC midnight
export const parseDateKey = (dateKey: string): Date => {
    const [year, month, day] = dateKey.split("-").map(Number);

    return new Date(year, month - 1, day);
};

export const formatWeekday = (dateKey: string, locale: string): string =>
    formatDate(parseDateKey(dateKey), locale, WEEKDAY_OPTIONS);

export const formatHistoryDay = (dateKey: string, locale: string): string =>
    formatDate(parseDateKey(dateKey), locale, DAY_NAME_OPTIONS);

export const historyMaxValue = (
    goal: number,
    days: readonly DailyIntakeDay[],
): number => Math.max(goal, ...days.map((day) => day.consumed), 1);

export const barHeightPercent = (consumed: number, maxValue: number): number =>
    (consumed / maxValue) * PERCENT_MULTIPLIER;

export const goalLinePercent = (goal: number, maxValue: number): number =>
    Math.min(barHeightPercent(goal, maxValue), PERCENT_MULTIPLIER);

export const dayTone = (day: DailyIntakeDay, goal: number): CalorieTone =>
    calorieToneFor(computeCalorieSummary([{ calories: day.consumed }], goal));
