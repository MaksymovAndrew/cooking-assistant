import type { DatabaseProbe } from "application/ports/DatabaseProbe";

export default class CheckHealth {
    constructor(private databaseProbe: DatabaseProbe) {}

    async execute(): Promise<boolean> {
        return this.databaseProbe.isReachable();
    }
}
