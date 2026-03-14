import { Title } from "./Title";

describe("Title", () => {
    // Valid cases
    test("should create a valid title", () => {
        expect(new Title("吾輩は猫である").value).toBe("吾輩は猫である");
    });

    test("should create a title with exactly MIN_LENGTH characters", () => {
        expect(new Title("A").value).toBe("A");
    });

    test("should create a title with exactly MAX_LENGTH characters", () => {
        const title = "A".repeat(Title.MAX_LENGTH);
        expect(new Title(title).value).toBe(title);
    });

    // Invalid cases - empty / whitespace
    test("should throw an error for empty string", () => {
        expect(() => new Title("")).toThrow("Title must be a non-empty string.");
    });

    test("should throw an error for whitespace-only string", () => {
        expect(() => new Title("   ")).toThrow("Title must be a non-empty string.");
    });

    // Invalid cases - length
    test("should throw an error for string exceeding MAX_LENGTH", () => {
        const title = "A".repeat(Title.MAX_LENGTH + 1);
        expect(() => new Title(title)).toThrow(
            `Title must be between ${Title.MIN_LENGTH} and ${Title.MAX_LENGTH} characters.`
        );
    });
});
