import ClearCheckedShoppingListItems from "application/use-cases/shopping-list/ClearCheckedShoppingListItems";

describe("ClearCheckedShoppingListItems", () => {
    it("should delete the user's checked items", async () => {
        const shoppingListRepository = { deleteChecked: jest.fn() };
        const useCase = new ClearCheckedShoppingListItems(
            shoppingListRepository,
        );

        await useCase.execute(7);

        expect(shoppingListRepository.deleteChecked).toHaveBeenCalledWith(7);
    });
});
