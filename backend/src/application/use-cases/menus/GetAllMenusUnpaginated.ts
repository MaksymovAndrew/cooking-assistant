import type { MenuRepository } from "domain/repositories/MenuRepository";

export default class GetAllMenusUnpaginated {
    constructor(
        private menuRepository: Pick<MenuRepository, "findAllUnpaginated">,
    ) {}

    async execute(): Promise<unknown[]> {
        return this.menuRepository.findAllUnpaginated();
    }
}
