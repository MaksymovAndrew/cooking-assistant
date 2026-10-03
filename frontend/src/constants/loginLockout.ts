// a client-side lockout on top of the server's 429
export const ATTEMPTS_PER_LOCK = 5;
export const LOCKOUT_LADDER_MINUTES = [1, 5];
export const FAILURE_RESET_IDLE_MINUTES = 30;
