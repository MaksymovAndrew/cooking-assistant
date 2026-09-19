import GetTags from "application/use-cases/tags/GetTags";

describe("GetTags", () => {
    it("should return the user's tags", async () => {
        const tagRepository = { findByPerson: jest.fn() };
        const tags = [{ id: 1, name: "Quick" }];

        tagRepository.findByPerson.mockResolvedValue(tags);

        const result = await new GetTags(tagRepository).execute("7");

        expect(result).toEqual(tags);
        expect(tagRepository.findByPerson).toHaveBeenCalledWith(7);
    });
});
