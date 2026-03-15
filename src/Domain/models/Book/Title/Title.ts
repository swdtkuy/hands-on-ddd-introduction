import { ValueObject } from "Domain/shared/ValueObject";

type TitleValue = string;
export class Title extends ValueObject<TitleValue, "Title"> {
  static readonly MAX_LENGTH = 1000;
  static readonly MIN_LENGTH = 1;

  constructor(value: TitleValue) {
    super(value);
  }

  protected validate(name: TitleValue): void {
    if (typeof name !== "string" || name.trim() === "") {
      throw new Error("Title must be a non-empty string.");
    }
    if (name.length < Title.MIN_LENGTH || name.length > Title.MAX_LENGTH) {
      throw new Error(
        `Title must be between ${Title.MIN_LENGTH} and ${Title.MAX_LENGTH} characters.`,
      );
    }
  }
}
