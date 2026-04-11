import { BookId } from "Domain/models/Book/BookId/BookId";
import { Comment } from "Domain/models/Review/Comment/Comment";
import { Name } from "Domain/models/Review/Name/Name";
import { Rating } from "Domain/models/Review/Rating/Rating";
import { Review } from "Domain/models/Review/Review";
import { ReviewId } from "Domain/models/Review/ReviewId/ReviewId";
import { ReviewIdentity } from "Domain/models/Review/ReviewIdentity/ReviewIdentity";

import { SQLClientManager } from "../SQLClientManager";
import { SQLReviewRepository } from "./SQLReviewRepository";

// Prevent db.ts from opening a real connection on import
jest.mock("pg", () => ({
  Pool: jest.fn().mockImplementation(() => ({ connect: jest.fn() })),
}));

const BOOK_ID = "9784123456789";

const makeReview = ({
  id = "review-abc",
  bookId = BOOK_ID,
  name = "山田 太郎",
  rating = 4,
  comment,
}: {
  id?: string;
  bookId?: string;
  name?: string;
  rating?: number;
  comment?: string;
} = {}): Review =>
  Review.reconstruct(
    new ReviewIdentity(new ReviewId(id)),
    new BookId(bookId),
    new Name(name),
    new Rating(rating),
    comment !== undefined ? new Comment(comment) : undefined,
  );

const makeRow = ({
  identity = "review-abc",
  book_id = BOOK_ID,
  name = "山田 太郎",
  rating = 4,
  comment = null,
}: {
  identity?: string;
  book_id?: string;
  name?: string;
  rating?: number;
  comment?: string | null;
} = {}) => ({ identity, book_id, name, rating, comment });

describe("SQLReviewRepository", () => {
  let mockQuery: jest.Mock;
  let repository: SQLReviewRepository;

  beforeEach(() => {
    mockQuery = jest.fn();
    const mockClient = { query: mockQuery } as any;
    const clientManager = {
      withClient: jest.fn((cb: (c: any) => Promise<any>) => cb(mockClient)),
    } as unknown as SQLClientManager;
    repository = new SQLReviewRepository(clientManager);
  });

  describe("save", () => {
    test("should execute INSERT with correct values (no comment)", async () => {
      mockQuery.mockResolvedValue({ rows: [], rowCount: 1 });
      const review = makeReview();

      await repository.save(review);

      const [sql, values] = mockQuery.mock.calls[0];
      expect(sql).toMatch(/INSERT INTO "Review"/i);
      expect(values).toEqual([
        review.reviewId.value,
        review.bookId.value,
        review.name.value,
        review.rating.value,
        undefined, // comment is undefined → no Comment object
      ]);
    });

    test("should pass comment value when comment is present", async () => {
      mockQuery.mockResolvedValue({ rows: [], rowCount: 1 });
      const review = makeReview({ comment: "とても良い本でした。" });

      await repository.save(review);

      const [, values] = mockQuery.mock.calls[0];
      expect(values[4]).toBe("とても良い本でした。");
    });
  });

  describe("update", () => {
    test("should execute UPDATE with correct values", async () => {
      mockQuery.mockResolvedValue({ rows: [], rowCount: 1 });
      const review = makeReview({ rating: 5, comment: "おすすめです。" });

      await repository.update(review);

      const [sql, values] = mockQuery.mock.calls[0];
      expect(sql).toMatch(/UPDATE "Review"/i);
      expect(values).toEqual([
        review.reviewId.value,
        review.bookId.value,
        review.name.value,
        review.rating.value,
        "おすすめです。",
      ]);
    });

    test("should throw when no row was updated (rowCount === 0)", async () => {
      mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
      const review = makeReview({ id: "non-existent" });

      await expect(repository.update(review)).rejects.toThrow(
        "non-existent",
      );
    });
  });

  describe("delete", () => {
    test("should execute DELETE with the given reviewId", async () => {
      mockQuery.mockResolvedValue({ rows: [], rowCount: 1 });
      const reviewId = new ReviewId("review-to-delete");

      await repository.delete(reviewId);

      const [sql, values] = mockQuery.mock.calls[0];
      expect(sql).toMatch(/DELETE FROM "Review"/i);
      expect(values).toEqual(["review-to-delete"]);
    });
  });

  describe("findById", () => {
    test("should return null when no row is found", async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await repository.findById(new ReviewId("missing"));

      expect(result).toBeNull();
    });

    test("should return a Review mapped from the row (no comment)", async () => {
      const row = makeRow();
      mockQuery.mockResolvedValue({ rows: [row] });

      const result = await repository.findById(new ReviewId(row.identity));

      expect(result).not.toBeNull();
      expect(result!.reviewId.value).toBe(row.identity);
      expect(result!.bookId.value).toBe(row.book_id);
      expect(result!.name.value).toBe(row.name);
      expect(result!.rating.value).toBe(row.rating);
      expect(result!.comment).toBeUndefined();
    });

    test("should map comment when row has a comment", async () => {
      const row = makeRow({ comment: "面白かったです。" });
      mockQuery.mockResolvedValue({ rows: [row] });

      const result = await repository.findById(new ReviewId(row.identity));

      expect(result!.comment?.value).toBe("面白かったです。");
    });

    test("should pass reviewId as the query parameter", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const reviewId = new ReviewId("review-xyz");

      await repository.findById(reviewId);

      const [sql, values] = mockQuery.mock.calls[0];
      expect(sql).toMatch(/"Review"/);
      expect(values).toEqual(["review-xyz"]);
    });
  });

  describe("findAllByBookId", () => {
    test("should return an empty array when no reviews exist", async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await repository.findAllByBookId(new BookId(BOOK_ID));

      expect(result).toEqual([]);
    });

    test("should return all reviews mapped to domain objects", async () => {
      const rows = [
        makeRow({ identity: "r1", rating: 5 }),
        makeRow({ identity: "r2", rating: 3, comment: "まあまあです。" }),
      ];
      mockQuery.mockResolvedValue({ rows });

      const result = await repository.findAllByBookId(new BookId(BOOK_ID));

      expect(result).toHaveLength(2);
      expect(result[0].reviewId.value).toBe("r1");
      expect(result[0].comment).toBeUndefined();
      expect(result[1].reviewId.value).toBe("r2");
      expect(result[1].comment?.value).toBe("まあまあです。");
    });

    test("should pass bookId as the query parameter", async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await repository.findAllByBookId(new BookId(BOOK_ID));

      const [, values] = mockQuery.mock.calls[0];
      expect(values).toEqual([BOOK_ID]);
    });
  });
});
