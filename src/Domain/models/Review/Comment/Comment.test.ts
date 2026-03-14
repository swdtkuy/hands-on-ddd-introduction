import { Comment } from "./Comment";

describe("Comment", () => {
    // Valid cases
    test("should create a valid comment", () => {
        expect(new Comment("a").value).toBe("a");
        expect(new Comment("Hello, world!").value).toBe("Hello, world!");
        expect(new Comment("a".repeat(1000)).value).toBe("a".repeat(1000));
    });

    // Invalid cases
    test("should throw an error for empty string", () => {
        expect(() => new Comment("")).toThrow("Comment must be a non-empty string.");
    });

    test("should throw an error for whitespace-only string", () => {
        expect(() => new Comment("   ")).toThrow("Comment must be a non-empty string.");
    });

    test("should throw an error for non-string values", () => {
        expect(() => new Comment(123 as any)).toThrow("Comment must be a non-empty string.");
    });

    test("should throw an error for strings exceeding max length", () => {
        expect(() => new Comment("a".repeat(1001))).toThrow(
            `Comment must be between ${Comment.MIN_LENGTH} and ${Comment.MAX_LENGTH} characters.`
        );
    });

    // getQualityFactor
    describe("getQualityFactor", () => {
        test("should return 0.2 for length at or below 10", () => {
            expect(new Comment("a".repeat(1)).getQualityFactor()).toBe(0.2);
            expect(new Comment("a".repeat(10)).getQualityFactor()).toBe(0.2);
        });

        test("should return 1.0 for length at or above 100", () => {
            expect(new Comment("a".repeat(100)).getQualityFactor()).toBe(1.0);
            expect(new Comment("a".repeat(200)).getQualityFactor()).toBe(1.0);
        });

        test("should return interpolated value for length between 10 and 100", () => {
            // length=55: 0.2 + 0.8 * (55 - 10) / (100 - 10) = 0.2 + 0.8 * 45/90 = 0.2 + 0.4 = 0.6
            expect(new Comment("a".repeat(55)).getQualityFactor()).toBeCloseTo(0.6);
        });
    });

    // extractMatches
    describe("extractMatches", () => {
        test("should return capture groups from a global pattern", () => {
            const comment = new Comment("foo bar baz");
            expect(comment.extractMatches(/(\w+)/g)).toEqual(["foo", "bar", "baz"]);
        });

        test("should convert a non-global pattern to global", () => {
            const comment = new Comment("hello world");
            expect(comment.extractMatches(/(\w+)/)).toEqual(["hello", "world"]);
        });

        test("should return empty array when pattern has no capture group", () => {
            const comment = new Comment("hello world");
            expect(comment.extractMatches(/\w+/g)).toEqual([]);
        });

        test("should return empty array when pattern does not match", () => {
            const comment = new Comment("hello world");
            expect(comment.extractMatches(/(\d+)/g)).toEqual([]);
        });
    });
});
