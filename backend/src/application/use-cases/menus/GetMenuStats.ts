import type { MenuRepository } from "domain/repositories/MenuRepository";
import type { MenuStatisticsDto } from "domain/repositories/menuStats.types";

export default class GetMenuStats {
    constructor(private menuRepository: Pick<MenuRepository, "getStats">) {}

    async execute(): Promise<MenuStatisticsDto> {
        return this.menuRepository.getStats();
    }
}
