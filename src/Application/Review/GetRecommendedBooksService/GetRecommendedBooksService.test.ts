import { BookId } from "Domain/models/Book/BookId/BookId";
import { Comment } from "Domain/models/Review/Comment/Comment";
import { Name } from "Domain/models/Review/Name/Name";
import { Rating } from "Domain/models/Review/Rating/Rating";
import { Review } from "Domain/models/Review/Review";
import { ReviewId } from "Domain/models/Review/ReviewId/ReviewId";
import { ReviewIdentity } from "Domain/models/Review/ReviewIdentity/ReviewIdentity";
import { InMemoryReviewRepository } from "Infrastructure/InMemory/Review/InMemoryReviewRepository";
import { GetRecommendedBooksService } from "./GetRecommendedBooksService";

const TARGET_BOOK_ID = "1234567890";
const OTHER_BOOK_ID = "9876543210";

const targetBookId = new BookId(TARGET_BOOK_ID);
const otherBookId = new BookId(OTHER_BOOK_ID);
const name = new Name("テスト太郎");

const trustworthyRating = new Rating(4);
const untrustworthyRating = new Rating(3);

let counter = 0;
const makeIdentity = () =>
  new ReviewIdentity(new ReviewId(`review-${++counter}`));

const commentWithBook = (title: string) =>
  new Comment(`『${title}』はとてもおすすめです。ぜひ読んでみてください。`);

const makeReview = (
  bookId: BookId,
  rating: Rating,
  comment?: Comment,
): Review => Review.create(makeIdentity(), bookId, name, rating, comment);

describe("GetRecommendedBooksService", () => {
  let repository: InMemoryReviewRepository;
  let service: GetRecommendedBooksService;

  beforeEach(() => {
    counter = 0;
    repository = new InMemoryReviewRepository();
    service = new GetRecommendedBooksService(repository);
  });

  it("レビューが存在しない場合、recommendedBooksは空のリストを返す", async () => {
    const result = await service.execute({
      bookId: TARGET_BOOK_ID,
      maxCount: 3,
    });

    expect(result.sourceBookId).toBe(TARGET_BOOK_ID);
    expect(result.recommendedBooks).toEqual([]);
  });

  it("信頼できないレビューしかない場合、recommendedBooksは空のリストを返す", async () => {
    await repository.save(
      makeReview(targetBookId, untrustworthyRating, commentWithBook("DDD入門")),
    );

    const result = await service.execute({
      bookId: TARGET_BOOK_ID,
      maxCount: 3,
    });

    expect(result.recommendedBooks).toEqual([]);
  });

  it("信頼できるレビューから書籍タイトルを返す", async () => {
    await repository.save(
      makeReview(targetBookId, trustworthyRating, commentWithBook("DDD入門")),
    );

    const result = await service.execute({
      bookId: TARGET_BOOK_ID,
      maxCount: 3,
    });

    expect(result.recommendedBooks).toContain("DDD入門");
  });

  it("maxCountで返却件数を制限する", async () => {
    for (const title of ["A", "B", "C", "D"]) {
      await repository.save(
        makeReview(targetBookId, trustworthyRating, commentWithBook(title)),
      );
    }

    const result = await service.execute({
      bookId: TARGET_BOOK_ID,
      maxCount: 2,
    });

    expect(result.recommendedBooks).toHaveLength(2);
  });

  it("対象のbookIdのレビューのみを集計する", async () => {
    await repository.save(
      makeReview(targetBookId, trustworthyRating, commentWithBook("対象本")),
    );
    await repository.save(
      makeReview(otherBookId, trustworthyRating, commentWithBook("除外本")),
    );

    const result = await service.execute({
      bookId: TARGET_BOOK_ID,
      maxCount: 3,
    });

    expect(result.recommendedBooks).toContain("対象本");
    expect(result.recommendedBooks).not.toContain("除外本");
  });

  it("推薦数の多い書籍が上位に来る", async () => {
    await repository.save(
      makeReview(targetBookId, trustworthyRating, commentWithBook("人気本")),
    );
    await repository.save(
      makeReview(targetBookId, trustworthyRating, commentWithBook("人気本")),
    );
    await repository.save(
      makeReview(targetBookId, trustworthyRating, commentWithBook("普通本")),
    );

    const result = await service.execute({
      bookId: TARGET_BOOK_ID,
      maxCount: 3,
    });

    expect(result.recommendedBooks[0]).toBe("人気本");
  });

  it("sourceBookIdはコマンドのbookIdと一致する", async () => {
    const result = await service.execute({
      bookId: TARGET_BOOK_ID,
      maxCount: 3,
    });

    expect(result.sourceBookId).toBe(TARGET_BOOK_ID);
  });
});
