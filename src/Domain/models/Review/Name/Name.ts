import { ValueObject } from "Domain/shared/ValueObject";

type NameValue = string;
export class Name extends ValueObject<NameValue, "Name"> {
  static readonly MAX_LENGTH = 50;
  static readonly MIN_LENGTH = 1;

  constructor(value: NameValue) {
    super(value);
  }

  protected validate(name: NameValue): void {
    if (typeof name !== "string" || name.trim() === "") {
      throw new Error("Name must be a non-empty string.");
    }
    if (name.length < Name.MIN_LENGTH || name.length > Name.MAX_LENGTH) {
      throw new Error(
        `Name must be between ${Name.MIN_LENGTH} and ${Name.MAX_LENGTH} characters.`,
      );
    }
  }
}
