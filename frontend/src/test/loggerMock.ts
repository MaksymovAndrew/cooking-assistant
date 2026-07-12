// jest stub for src/config/logger.ts, whose import.meta.env cannot be compiled by @swc/jest under CommonJS; mapped in jest.config.cjs moduleNameMapper
export const logger = {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
};
