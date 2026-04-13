import { container } from "tsyringe";
import { BookId } from "Domain/models/Book/BookId/BookId";
import { Name } from "Domain/models/Review/Name/Name";
import { Rating } from "Domain/models/Review/Rating/Rating";
import { Review } from "Domain/models/Review/Review";
import { ReviewId } from "Domain/models/Review/ReviewId/ReviewId";
import { ReviewIdentity } from "Domain/models/Review/ReviewIdentity/ReviewIdentity";
import { InMemoryReviewRepository } from "Infrastructure/InMemory/Review/InMemoryReviewRepository";
import { DeleteReviewService } from "./DeleteReviewService";

const BOOK_ID = "1234567890";
const REVIEW_ID = "test-review-id-001";

const makeReview = (reviewId = REVIEW_ID): Review =>
  Review.reconstruct(
    new ReviewIdentity(new ReviewId(reviewId)),
    new BookId(BOOK_ID),
    new Name("レビュアー"),
    new Rating(4),
  );

describe("DeleteReviewService", () => {
  let reviewRepository: InMemoryReviewRepository;
  let service: DeleteReviewService;

  beforeEach(async () => {
    service = container.resolve(DeleteReviewService);
    reviewRepository = service["reviewRepository"] as InMemoryReviewRepository;
    await reviewRepository.save(makeReview());
  });

  it("指定したreviewIdのレビューを削除する", async () => {
    await service.execute({ reviewId: REVIEW_ID });

    const result = await reviewRepository.findById({ value: REVIEW_ID } as any);
    expect(result).toBeNull();
  });

  it("削除後はリポジトリからレビューが取得できない", async () => {
    await reviewRepository.save(makeReview("other-review-id"));

    await service.execute({ reviewId: REVIEW_ID });

    const deleted = await reviewRepository.findById(
      { value: REVIEW_ID } as any,
    );
    const remaining = await reviewRepository.findById(
      { value: "other-review-id" } as any,
    );
    expect(deleted).toBeNull();
    expect(remaining).not.toBeNull();
  });

  it("存在しないreviewIdを指定するとエラーをスローする", async () => {
    await expect(
      service.execute({ reviewId: "non-existent-id" }),
    ).rejects.toThrow("Review with ID non-existent-id not found.");
  });
});
