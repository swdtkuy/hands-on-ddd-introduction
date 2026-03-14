import { ReviewId } from "./ReviewId";

describe("ReviewId", () => {
    // Auto-generation
    test("should generate a valid ID when no argument is provided", () => {
        const id = new ReviewId();
        expect(typeof id.value).toBe("string");
        expect(id.value.length).toBeGreaterThanOrEqual(ReviewId.MIN_LENGTH);
        expect(id.value.length).toBeLessThanOrEqual(ReviewId.MAX_LENGTH);
    });

    // Valid cases
    test("should create with a valid string", () => {
        expect(new ReviewId("review-123").value).toBe("review-123");
    });

    test("should create with a 1-character string (MIN_LENGTH)", () => {
        expect(new ReviewId("a").value).toBe("a");
    });

    test("should create with a 100-character string (MAX_LENGTH)", () => {
        const value = "a".repeat(100);
        expect(new ReviewId(value).value).toBe(value);
    });

    // Invalid cases - empty / whitespace
    test("should throw for empty string", () => {
        expect(() => new ReviewId("")).toThrow("ReviewId must be a non-empty string.");
    });

    test("should throw for whitespace-only string", () => {
        expect(() => new ReviewId("   ")).toThrow("ReviewId must be a non-empty string.");
    });

    // Invalid cases - length
    test("should throw for string longer than 100 characters", () => {
        expect(() => new ReviewId("a".repeat(101))).toThrow(
            `ReviewId must be between ${ReviewId.MIN_LENGTH} and ${ReviewId.MAX_LENGTH} characters.`
        );
    });
});
