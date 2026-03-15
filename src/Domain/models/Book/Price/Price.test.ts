import { Price } from "./Price";

describe("Price", () => {
  // Valid cases
  test("should create a valid price", () => {
    const price = new Price({ amount: 1000, currency: "JPY" });
    expect(price.amount).toBe(1000);
    expect(price.currency).toBe("JPY");
  });

  test("should create a price with exactly MIN amount", () => {
    const price = new Price({ amount: Price.MIN, currency: "JPY" });
    expect(price.amount).toBe(Price.MIN);
  });

  test("should create a price with exactly MAX amount", () => {
    const price = new Price({ amount: Price.MAX, currency: "JPY" });
    expect(price.amount).toBe(Price.MAX);
  });

  // Invalid cases - amount
  test("should throw an error for negative amount", () => {
    expect(() => new Price({ amount: -1, currency: "JPY" })).toThrow(
      "Price amount must be a non-negative number.",
    );
  });

  test("should throw an error for non-number amount", () => {
    expect(() => new Price({ amount: NaN, currency: "JPY" })).toThrow(
      "Price amount must be a non-negative number.",
    );
  });

  test("should throw an error for amount below MIN", () => {
    expect(() => new Price({ amount: Price.MIN - 1, currency: "JPY" })).toThrow(
      `Price amount must be between ${Price.MIN} and ${Price.MAX}.`,
    );
  });

  test("should throw an error for amount above MAX", () => {
    expect(() => new Price({ amount: Price.MAX + 1, currency: "JPY" })).toThrow(
      `Price amount must be between ${Price.MIN} and ${Price.MAX}.`,
    );
  });

  // Invalid cases - currency
  test("should throw an error for unsupported currency", () => {
    expect(() => new Price({ amount: 1000, currency: "USD" as "JPY" })).toThrow(
      "Unsupported currency. Only JPY is supported.",
    );
  });
});
