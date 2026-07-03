// escalating client-side login lockout, layered on top of the server's 429.
// every ATTEMPTS_PER_LOCK failures trigger a lock; the lock duration climbs
// one step up the ladder each time, holding at the last step once reached.
export const ATTEMPTS_PER_LOCK = 5;
export const LOCKOUT_LADDER_MINUTES = [1, 5, 10, 30, 60];
