import { ValueObject } from "Domain/shared/ValueObject";

type BookIdValue = string;
export class BookId extends ValueObject<BookIdValue, "BookId"> {
  static MAX_LENGTH = 13;
  static MIN_LENGTH = 10;

  constructor(value: BookIdValue) {
    super(value);
  }

  protected validate(isbn: BookIdValue): void {
    if (typeof isbn !== "string" || isbn.trim() === "") {
      throw new Error("BookId must be a non-empty string.");
    }
    if (isbn.length < BookId.MIN_LENGTH || isbn.length > BookId.MAX_LENGTH) {
      throw new Error(
        `Invalid ISBN length. Must be between ${BookId.MIN_LENGTH} and ${BookId.MAX_LENGTH} characters.`,
      );
    }
    if (!this.isValidISBN10(isbn) && !this.isValidISBN13(isbn)) {
      throw new Error(
        "Invalid ISBN format. Must be a valid ISBN-10 or ISBN-13 format.",
      );
    }
  }

  private isValidISBN10(isbn10: string): boolean {
    return isbn10.length === 10;
  }

  private isValidISBN13(isbn13: string): boolean {
    return (
      (isbn13.startsWith("978") || isbn13.startsWith("979")) &&
      isbn13.length === 13
    );
  }

  toISBN(): string {
    if (this._value.length === BookId.MIN_LENGTH) {
      const groupIdentifier = this._value.slice(0, 1); // Country Code (1 digit)
      const publisherCode = this._value.slice(1, 3); // Publisher Code (2 digits)
      const bookCode = this._value.slice(3, 9); // Book Code (6 digits)
      const checkDigit = this._value.slice(9); // Check Digit (1 digit)
      return `ISBN${groupIdentifier}-${publisherCode}-${bookCode}-${checkDigit}`;
    } else {
      const isbnPrefix = this._value.slice(0, 3); // ISBN Prefix (978 or 979)
      const groupIdentifier = this._value.slice(3, 4); // Country Code (1 digit)
      const publisherCode = this._value.slice(4, 6); // Publisher Code (2 digits)
      const bookCode = this._value.slice(6, 12); // Book Code (6 digits)
      const checkDigit = this._value.slice(12); // Check Digit (1 digit)
      return `ISBN${isbnPrefix}-${groupIdentifier}-${publisherCode}-${bookCode}-${checkDigit}`;
    }
  }
}
