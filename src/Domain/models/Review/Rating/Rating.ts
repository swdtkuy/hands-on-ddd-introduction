import { ValueObject } from "Domain/shared/ValueObject";

type RatingValue = number;
export class Rating extends ValueObject<RatingValue, "Rating"> {
  static readonly MAX = 5;
  static readonly MIN = 1;

  constructor(value: RatingValue) {
    super(value);
  }

  protected validate(value: RatingValue): void {
    if (!Number.isInteger(value)) {
      throw new Error("Rating value must be an integer.");
    }
    if (value < Rating.MIN || value > Rating.MAX) {
      throw new Error(
        `Rating value must be between ${Rating.MIN} and ${Rating.MAX}.`,
      );
    }
  }

  /**
   * Calculates the quality factor of the rating, which is a normalized value between 0.0 and 1.0.
   * @returns The quality factor.
   */
  getQualityFactor(): number {
    return (this._value - Rating.MIN) / (Rating.MAX - Rating.MIN);
  }
}
