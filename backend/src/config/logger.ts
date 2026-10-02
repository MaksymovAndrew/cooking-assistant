import pino from "pino";

import { config } from "./env";

const isTest = config.nodeEnv === "test";

export const logger = pino({
    level: isTest ? "silent" : config.logLevel,
});
