import { Rating } from "./Rating";

describe("Rating", () => {
  // Valid cases
  test("should create a valid rating", () => {
    expect(new Rating(1).value).toBe(1);
    expect(new Rating(3).value).toBe(3);
    expect(new Rating(5).value).toBe(5);
  });

  test("getQualityFactor should return the correct quality factor", () => {
    expect(new Rating(1).getQualityFactor()).toBe(0.0);
    expect(new Rating(3).getQualityFactor()).toBe(0.5);
    expect(new Rating(5).getQualityFactor()).toBe(1.0);
  });

  // Invalid cases
  test("should throw an error for non-integer values", () => {
    expect(() => new Rating(2.5)).toThrow("Rating value must be an integer.");
    expect(() => new Rating("3" as any)).toThrow(
      "Rating value must be an integer.",
    );
  });

  test("should throw an error for values below the minimum", () => {
    expect(() => new Rating(0)).toThrow(
      "Rating value must be between 1 and 5.",
    );
  });

  test("should throw an error for values above the maximum", () => {
    expect(() => new Rating(6)).toThrow(
      "Rating value must be between 1 and 5.",
    );
  });
});
