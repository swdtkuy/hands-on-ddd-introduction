import { Name } from "./Name";

describe("Name", () => {
    test("should create a valid name", () => {
        expect(new Name("a").value).toBe("a");
        expect(new Name("John Doe").value).toBe("John Doe");
        expect(new Name("a".repeat(50)).value).toBe("a".repeat(50));
    });

    test("should throw an error for empty string", () => {
        expect(() => new Name("")).toThrow("Name must be a non-empty string.");
    });

    test("should throw an error for whitespace-only string", () => {
        expect(() => new Name("   ")).toThrow("Name must be a non-empty string.");
    });

    test("should throw an error for non-string values", () => {
        expect(() => new Name(123 as any)).toThrow("Name must be a non-empty string.");
    });

    test("should throw an error for strings exceeding max length", () => {
        expect(() => new Name("a".repeat(51))).toThrow(
            `Name must be between ${Name.MIN_LENGTH} and ${Name.MAX_LENGTH} characters.`
        );
    });
});
