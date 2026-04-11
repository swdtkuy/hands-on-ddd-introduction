import { BookId } from "Domain/models/Book/BookId/BookId";
import { Comment } from "Domain/models/Review/Comment/Comment";
import { Name } from "Domain/models/Review/Name/Name";
import { Rating } from "Domain/models/Review/Rating/Rating";
import { Review } from "Domain/models/Review/Review";
import { ReviewId } from "Domain/models/Review/ReviewId/ReviewId";
import { ReviewIdentity } from "Domain/models/Review/ReviewIdentity/ReviewIdentity";
import { InMemoryReviewRepository } from "Infrastructure/InMemory/Review/InMemoryReviewRepository";
import { MockTransactionManager } from "Application/shared/MockTransactionManager";
import { EditReviewService } from "./EditReviewService";

const BOOK_ID = "1234567890";
const REVIEW_ID = "test-review-id-001";

const makeReview = (overrides?: {
  reviewId?: string;
  name?: string;
  rating?: number;
  comment?: string;
}): Review =>
  Review.reconstruct(
    new ReviewIdentity(new ReviewId(overrides?.reviewId ?? REVIEW_ID)),
    new BookId(BOOK_ID),
    new Name(overrides?.name ?? "レビュアー"),
    new Rating(overrides?.rating ?? 4),
    overrides?.comment !== undefined
      ? new Comment(overrides.comment)
      : undefined,
  );

describe("EditReviewService", () => {
  let reviewRepository: InMemoryReviewRepository;
  let service: EditReviewService;

  beforeEach(async () => {
    reviewRepository = new InMemoryReviewRepository();
    service = new EditReviewService(
      reviewRepository,
      new MockTransactionManager(),
    );
    await reviewRepository.save(makeReview());
  });

  it("nameを更新し、更新後のDTOを返す", async () => {
    const result = await service.execute({
      reviewId: REVIEW_ID,
      name: "新しいレビュアー",
    });

    expect(result.name).toBe("新しいレビュアー");
    expect(result.rating).toBe(4);
    expect(result.comment).toBeUndefined();
  });

  it("ratingを更新し、更新後のDTOを返す", async () => {
    const result = await service.execute({
      reviewId: REVIEW_ID,
      rating: 2,
    });

    expect(result.rating).toBe(2);
    expect(result.name).toBe("レビュアー");
  });

  it("commentを新規追加する", async () => {
    const result = await service.execute({
      reviewId: REVIEW_ID,
      comment: "良い本でした。",
    });

    expect(result.comment).toBe("良い本でした。");
  });

  it("comment を空文字で渡すとcommentが削除される", async () => {
    await reviewRepository.save(makeReview({ comment: "もとのコメント" }));

    const result = await service.execute({
      reviewId: REVIEW_ID,
      comment: "",
    });

    expect(result.comment).toBeUndefined();
  });

  it("name・rating・commentをまとめて更新できる", async () => {
    const result = await service.execute({
      reviewId: REVIEW_ID,
      name: "一括更新者",
      rating: 5,
      comment: "完璧な本です。",
    });

    expect(result.name).toBe("一括更新者");
    expect(result.rating).toBe(5);
    expect(result.comment).toBe("完璧な本です。");
  });

  it("更新内容がリポジトリに反映される", async () => {
    await service.execute({
      reviewId: REVIEW_ID,
      name: "永続化確認者",
    });

    const saved = await reviewRepository.findById({ value: REVIEW_ID } as any);
    expect(saved?.name.value).toBe("永続化確認者");
  });

  it("DTOにid・bookIdが正しく含まれる", async () => {
    const result = await service.execute({
      reviewId: REVIEW_ID,
      rating: 3,
    });

    expect(result.id).toBe(REVIEW_ID);
    expect(result.bookId).toBe(BOOK_ID);
  });

  it("存在しないreviewIdを指定するとエラーをスローする", async () => {
    await expect(
      service.execute({
        reviewId: "non-existent-id",
        name: "レビュアー",
      }),
    ).rejects.toThrow("Review with ID non-existent-id not found.");
  });
});
