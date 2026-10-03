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

// also re-checks on tab focus: background tabs throttle setTimeout and may miss midnight
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
