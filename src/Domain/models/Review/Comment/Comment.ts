import { ValueObject } from "Domain/shared/ValueObject";

type CommentValue = string;

export class Comment extends ValueObject<CommentValue, "Comment"> {
  static readonly MAX_LENGTH = 1000;
  static readonly MIN_LENGTH = 1;

  constructor(value: CommentValue) {
    super(value);
  }

  protected validate(value: CommentValue): void {
    if (typeof value !== "string" || value.trim() === "") {
      throw new Error("Comment must be a non-empty string.");
    }
    if (
      value.length < Comment.MIN_LENGTH ||
      value.length > Comment.MAX_LENGTH
    ) {
      throw new Error(
        `Comment must be between ${Comment.MIN_LENGTH} and ${Comment.MAX_LENGTH} characters.`,
      );
    }
  }

  /**
   * Calculates the quality factor of the comment based on its length, which is a normalized value between 0.2 and 1.0.
   * @returns The quality factor.
   */
  getQualityFactor(): number {
    const minLength = 10;
    const optimalLength = 100;

    const length = this._value.trim().length;
    if (length <= minLength) {
      return 0.2;
    }

    if (length >= optimalLength) {
      return 1.0;
    }

    return 0.2 + (0.8 * (length - minLength)) / (optimalLength - minLength);
  }

  /**
   * extractMatches method takes a regular expression pattern and returns an array of all matches found in the comment's value.
   * @param pattern
   * @returns An array of matches found in the comment's value.
   */
  extractMatches(pattern: RegExp): string[] {
    const results: string[] = [];
    const text = this._value;

    const globalPatter = pattern.global
      ? pattern
      : new RegExp(pattern.source, pattern.flags + "g");

    let match;
    while ((match = globalPatter.exec(text)) !== null) {
      if (match[1]) {
        results.push(match[1]);
      }
    }

    return results;
  }
}
