import { useEffect, useState } from "react";

const todayKey = (): string => new Date().toDateString();

const msUntilNextLocalMidnight = (): number => {
    const now = new Date();
    const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
    );

    return nextMidnight.getTime() - now.getTime();
};

// shared "what day is it" signal for every day-boundary feature (calorie budget, history chart, limit notice) - a stable key that only changes at local midnight, so a tab left open overnight recomputes instead of freezing on the day it mounted. Re-checks on tab focus too, since background tabs throttle setTimeout and may miss the exact tick.
export const useTodayDateKey = (): string => {
    const [key, setKey] = useState(todayKey);

    useEffect(() => {
        const sync = () => {
            setKey(todayKey());
        };

        const timer = setTimeout(sync, msUntilNextLocalMidnight());

        document.addEventListener("visibilitychange", sync);

        return () => {
            clearTimeout(timer);
            document.removeEventListener("visibilitychange", sync);
        };
    }, [key]);

    return key;
};
