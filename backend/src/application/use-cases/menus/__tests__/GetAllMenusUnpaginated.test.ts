import GetAllMenusUnpaginated from "application/use-cases/menus/GetAllMenusUnpaginated";

describe("GetAllMenusUnpaginated", () => {
    it("should return all menus from the repository", async () => {
        const menus = [{ id: 1, title: "Weekday menu" }];
        const menuRepository = {
            findAllUnpaginated: jest.fn().mockResolvedValue(menus),
        };
        const useCase = new GetAllMenusUnpaginated(menuRepository);

        const result = await useCase.execute();

        expect(menuRepository.findAllUnpaginated).toHaveBeenCalledWith();
        expect(result).toEqual(menus);
    });
});
