import { BookId } from "../Book/BookId/BookId";
import { Comment } from "./Comment/Comment";
import { Name } from "./Name/Name";
import { Rating } from "./Rating/Rating";
import { ReviewId } from "./ReviewId/ReviewId";
import { ReviewIdentity } from "./ReviewIdentity/ReviewIdentity";

export class Review {
  private constructor(
    private readonly _identity: ReviewIdentity,
    private readonly _bookId: BookId,
    private _name: Name,
    private _rating: Rating,
    private _comment?: Comment,
  ) {}

  static create(
    identity: ReviewIdentity,
    bookId: BookId,
    name: Name,
    rating: Rating,
    comment?: Comment,
  ): Review {
    return new Review(identity, bookId, name, rating, comment);
  }

  static reconstruct(
    identity: ReviewIdentity,
    bookId: BookId,
    name: Name,
    rating: Rating,
    comment?: Comment,
  ): Review {
    return new Review(identity, bookId, name, rating, comment);
  }

  isTrustworthy(threshold: number = 0.6): boolean {
    if (!this._comment) {
      return this._rating.getQualityFactor() >= threshold;
    }

    const ratingFactor = this._rating.getQualityFactor();
    const commentFactor = this._comment.getQualityFactor();

    const combinedFactor = ratingFactor * 0.7 + commentFactor * 0.3;

    return combinedFactor >= threshold;
  }

  extractRecommendedBooks(): string[] {
    if (!this._comment) {
      return [];
    }

    const pattern =
      /[『「]([^』」]+)[』」][^。]{0,30}(?:読む|読んだ|学ぶ|学んだ|必要|推奨|おすすめ|良い|いい|理解)/g;

    const matches = this._comment.extractMatches(pattern);
    return Array.from(new Set(matches));
  }

  equals(other: Review): boolean {
    return this._identity.equals(other._identity);
  }

  get reviewId(): ReviewId {
    return this._identity.reviewId;
  }

  get bookId(): BookId {
    return this._bookId;
  }

  get name(): Name {
    return this._name;
  }

  get rating(): Rating {
    return this._rating;
  }

  get comment(): Comment | undefined {
    return this._comment;
  }

  updateName(name: Name): void {
    this._name = name;
  }

  updateRating(rating: Rating): void {
    this._rating = rating;
  }

  editComment(comment: Comment | undefined): void {
    this._comment = comment;
  }
}
