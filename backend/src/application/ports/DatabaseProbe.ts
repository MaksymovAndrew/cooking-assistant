export interface DatabaseProbe {
    // false instead of throwing: an unreachable database is an answer the health check reports
    isReachable(): Promise<boolean>;
}
