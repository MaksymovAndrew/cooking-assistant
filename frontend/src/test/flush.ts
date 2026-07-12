import { act } from "@testing-library/react";

// settle pending microtasks (resolved promises and the state updates they trigger) inside act - the common "let the awaited mock resolve" step in hook/component tests
export const flushMicrotasks = async (): Promise<void> => {
    await act(async () => {
        await Promise.resolve();
    });
};

// also settle pending macrotasks - needed when the code under test schedules a timer or chains lazy dynamic imports
export const flushMacrotasks = async (): Promise<void> => {
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
    });
};
