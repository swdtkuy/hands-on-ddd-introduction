import { ValueObject } from "Domain/shared/ValueObject";

interface PriceValue {
  amount: number;
  currency: "JPY"; // Extend with more currencies as needed
}

export class Price extends ValueObject<PriceValue, "Price"> {
  static readonly MAX = 1000000;
  static readonly MIN = 1;

  constructor(value: PriceValue) {
    super(value);
  }

  protected validate(price: PriceValue): void {
    if (
      typeof price.amount !== "number" ||
      isNaN(price.amount) ||
      price.amount < 0
    ) {
      throw new Error("Price amount must be a non-negative number.");
    }
    if (price.currency !== "JPY") {
      throw new Error("Unsupported currency. Only JPY is supported.");
    }
    if (price.amount < Price.MIN || price.amount > Price.MAX) {
      throw new Error(
        `Price amount must be between ${Price.MIN} and ${Price.MAX}.`,
      );
    }
  }

  get amount(): PriceValue["amount"] {
    return this.value.amount;
  }

  get currency(): PriceValue["currency"] {
    return this.value.currency;
  }
}
