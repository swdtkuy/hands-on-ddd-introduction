import { BookId } from "Domain/models/Book/BookId/BookId";
import { IReviewRepository } from "Domain/models/Review/IReviewRepository";
import { Review } from "Domain/models/Review/Review";
import { ReviewId } from "Domain/models/Review/ReviewId/ReviewId";

export class InMemoryReviewRepository implements IReviewRepository {
  private reviews: Map<string, Review> = new Map();

  async save(review: Review): Promise<void> {
    this.reviews.set(review.reviewId.value, review);
  }

  async update(review: Review): Promise<void> {
    if (!this.reviews.has(review.reviewId.value)) {
      throw new Error(`Review with ID ${review.reviewId.value} not found`);
    }
    this.reviews.set(review.reviewId.value, review);
  }

  async delete(reviewId: ReviewId): Promise<void> {
    this.reviews.delete(reviewId.value);
  }

  async findById(reviewId: ReviewId): Promise<Review | null> {
    return this.reviews.get(reviewId.value) || null;
  }

  async findAllByBookId(bookId: BookId): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.bookId.value === bookId.value,
    );
  }
}
