import { BookId } from "./BookId";

describe("BookId", () => {
    // Valid cases
    test("should create a valid ISBN-10", () => {
        expect(new BookId("4798126700").value).toBe("4798126700");
    });

    test("should create a valid ISBN-13 starting with 978", () => {
        expect(new BookId("9784798126708").value).toBe("9784798126708");
    });

    test("should create a valid ISBN-13 starting with 979", () => {
        expect(new BookId("9791032317785").value).toBe("9791032317785");
    });

    // Invalid cases - empty / whitespace
    test("should throw an error for empty string", () => {
        expect(() => new BookId("")).toThrow("BookId must be a non-empty string.");
    });

    test("should throw an error for whitespace-only string", () => {
        expect(() => new BookId("   ")).toThrow("BookId must be a non-empty string.");
    });

    // Invalid cases - length
    test("should throw an error for string shorter than 10 characters", () => {
        expect(() => new BookId("123456789")).toThrow(
            "Invalid ISBN length. Must be between 10 and 13 characters."
        );
    });

    test("should throw an error for 11-character string", () => {
        expect(() => new BookId("12345678901")).toThrow(
            "Invalid ISBN format. Must be a valid ISBN-10 or ISBN-13 format."
        );
    });

    test("should throw an error for 12-character string", () => {
        expect(() => new BookId("123456789012")).toThrow(
            "Invalid ISBN format. Must be a valid ISBN-10 or ISBN-13 format."
        );
    });

    test("should throw an error for string longer than 13 characters", () => {
        expect(() => new BookId("12345678901234")).toThrow(
            "Invalid ISBN length. Must be between 10 and 13 characters."
        );
    });

    // Invalid cases - format
    test("should throw an error for ISBN-13 not starting with 978 or 979", () => {
        expect(() => new BookId("9991234567890")).toThrow(
            "Invalid ISBN format. Must be a valid ISBN-10 or ISBN-13 format."
        );
    });

    // toISBN method
    test("should convert ISBN-10 to ISBN format", () => {
        const bookId = new BookId("4798126700");
        expect(bookId.toISBN()).toBe("ISBN4-79-812670-0");
    });

    test("should convert ISBN-13 (978) to ISBN format", () => {
        const bookId = new BookId("9784798126708");
        expect(bookId.toISBN()).toBe("ISBN978-4-79-812670-8");
    });

    test("should convert ISBN-13 (979) to ISBN format", () => {
        const bookId = new BookId("9791032317785");
        expect(bookId.toISBN()).toBe("ISBN979-1-03-231778-5");
    });
});
