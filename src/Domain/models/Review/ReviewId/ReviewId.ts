import { nanoid } from "nanoid";

import { ValueObject } from "Domain/shared/ValueObject";

type ReviewIdValue = string;
export class ReviewId extends ValueObject<ReviewIdValue, "ReviewId"> {
    static readonly MAX_LENGTH = 100;
    static readonly MIN_LENGTH = 1;

    constructor(value?: ReviewIdValue) {
        super(value ?? nanoid());
    }

    protected validate(value: ReviewIdValue): void {
        if (typeof value !== "string" || value.trim() === "") {
            throw new Error("ReviewId must be a non-empty string.");
        }
        if (value.length < ReviewId.MIN_LENGTH || value.length > ReviewId.MAX_LENGTH) {
            throw new Error(`ReviewId must be between ${ReviewId.MIN_LENGTH} and ${ReviewId.MAX_LENGTH} characters.`);
        }
    }
}