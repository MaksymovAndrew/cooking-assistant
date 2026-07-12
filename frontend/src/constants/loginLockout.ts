// client-side lockout on top of the server's 429; duration climbs the ladder each time it's hit
export const ATTEMPTS_PER_LOCK = 5;
export const LOCKOUT_LADDER_MINUTES = [1, 5, 10, 30, 60];
