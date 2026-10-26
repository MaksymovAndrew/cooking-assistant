export const stubMatchMedia = (matches: boolean): void => {
    window.matchMedia = jest.fn().mockReturnValue({
        matches,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
    });
};
