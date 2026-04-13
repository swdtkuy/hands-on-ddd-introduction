import { BookId } from "Domain/models/Book/BookId/BookId";
import { Comment } from "Domain/models/Review/Comment/Comment";
import { IReviewRepository } from "Domain/models/Review/IReviewRepository";
import { Name } from "Domain/models/Review/Name/Name";
import { Rating } from "Domain/models/Review/Rating/Rating";
import { Review } from "Domain/models/Review/Review";
import { ReviewId } from "Domain/models/Review/ReviewId/ReviewId";
import { ReviewIdentity } from "Domain/models/Review/ReviewIdentity/ReviewIdentity";
import { injectable } from "tsyringe";

import { SQLClientManager } from "../SQLClientManager";

type ReviewRow = {
  reviewId: string;
  bookId: string;
  name: string;
  rating: number;
  comment: string | null;
};

@injectable()
export class SQLReviewRepository implements IReviewRepository {
  constructor(private readonly clientManager: SQLClientManager) {}

  private toDomain(row: ReviewRow): Review {
    const comment = row.comment ? new Comment(row.comment) : undefined;
    return Review.reconstruct(
      new ReviewIdentity(new ReviewId(row.reviewId)),
      new BookId(row.bookId),
      new Name(row.name),
      new Rating(row.rating),
      comment,
    );
  }

  async save(review: Review): Promise<void> {
    return await this.clientManager.withClient(async (client) => {
      const query = `
            INSERT INTO "Review" (
            "reviewId",
            "bookId",
            "name",
            "rating",
            "comment"
            ) VALUES ($1, $2, $3, $4, $5)
        `;
      const values = [
        review.reviewId.value,
        review.bookId.value,
        review.name.value,
        review.rating.value,
        review.comment?.value,
      ];
      await client.query(query, values);
    });
  }

  async update(review: Review): Promise<void> {
    return await this.clientManager.withClient(async (client) => {
      const query = `
            UPDATE "Review" SET
            "bookId" = $2,
            "name" = $3,
            "rating" = $4,
            "comment" = $5
            WHERE "reviewId" = $1
        `;
      const values = [
        review.reviewId.value,
        review.bookId.value,
        review.name.value,
        review.rating.value,
        review.comment?.value,
      ];
      const result = await client.query(query, values);

      if (result.rowCount === 0) {
        throw new Error(`Review with ID ${review.reviewId.value} not found`);
      }
    });
  }

  async delete(reviewId: ReviewId): Promise<void> {
    return await this.clientManager.withClient(async (client) => {
      const query = `DELETE FROM "Review" WHERE "reviewId" = $1`;
      const values = [reviewId.value];
      await client.query(query, values);
    });
  }

  async findById(reviewId: ReviewId): Promise<Review | null> {
    return await this.clientManager.withClient(async (client) => {
      const query = `SELECT * FROM "Review" WHERE "reviewId" = $1`;
      const values = [reviewId.value];
      const result = await client.query(query, values);
      if (result.rows.length === 0) {
        return null;
      }
      return this.toDomain(result.rows[0]);
    });
  }

  async findAllByBookId(bookId: BookId): Promise<Review[]> {
    return await this.clientManager.withClient(async (client) => {
      const query = `SELECT * FROM "Review" WHERE "bookId" = $1`;
      const values = [bookId.value];
      const result = await client.query(query, values);
      return result.rows.map((row) => this.toDomain(row));
    });
  }
}
