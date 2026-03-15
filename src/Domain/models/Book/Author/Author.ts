import { ValueObject } from "Domain/shared/ValueObject";

type AuthorValue = string;
export class Author extends ValueObject<AuthorValue, "Author"> {
  static readonly MAX_LENGTH = 100;
  static readonly MIN_LENGTH = 1;

  constructor(value: AuthorValue) {
    super(value);
  }

  protected validate(name: AuthorValue): void {
    if (typeof name !== "string" || name.trim() === "") {
      throw new Error("Author name must be a non-empty string.");
    }
    if (name.length < Author.MIN_LENGTH || name.length > Author.MAX_LENGTH) {
      throw new Error(
        `Author name must be between ${Author.MIN_LENGTH} and ${Author.MAX_LENGTH} characters.`,
      );
    }
  }
}
