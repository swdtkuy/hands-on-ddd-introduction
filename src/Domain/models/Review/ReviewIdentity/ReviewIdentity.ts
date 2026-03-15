import { ReviewId } from "../ReviewId/ReviewId";

export class ReviewIdentity {
    constructor(private readonly _reviewId: ReviewId) {}

    equals(other: ReviewIdentity): boolean {
        return this._reviewId.equals(other._reviewId);
    }

    get reviewId(): ReviewId {
        return this._reviewId;
    }
}