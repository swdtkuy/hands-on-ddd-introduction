import { Author } from "./Author";

describe("Author", () => {
  // Valid cases
  test("should create a valid author name", () => {
    expect(new Author("山田太郎").value).toBe("山田太郎");
  });

  test("should create an author name with exactly MIN_LENGTH characters", () => {
    expect(new Author("A").value).toBe("A");
  });

  test("should create an author name with exactly MAX_LENGTH characters", () => {
    const name = "A".repeat(Author.MAX_LENGTH);
    expect(new Author(name).value).toBe(name);
  });

  // Invalid cases - empty / whitespace
  test("should throw an error for empty string", () => {
    expect(() => new Author("")).toThrow(
      "Author name must be a non-empty string.",
    );
  });

  test("should throw an error for whitespace-only string", () => {
    expect(() => new Author("   ")).toThrow(
      "Author name must be a non-empty string.",
    );
  });

  // Invalid cases - length
  test("should throw an error for string exceeding MAX_LENGTH", () => {
    const name = "A".repeat(Author.MAX_LENGTH + 1);
    expect(() => new Author(name)).toThrow(
      `Author name must be between ${Author.MIN_LENGTH} and ${Author.MAX_LENGTH} characters.`,
    );
  });
});
