import { Author } from "Domain/models/Book/Author/Author";
import { Book } from "Domain/models/Book/Book";
import { BookId } from "Domain/models/Book/BookId/BookId";
import { BookIdentity } from "Domain/models/Book/BookIdentity/BookIdentity";
import { Price } from "Domain/models/Book/Price/Price";
import { Title } from "Domain/models/Book/Title/Title";
import { InMemoryBookRepository } from "Infrastructure/InMemory/Book/InMemoryBookRepository";
import { InMemoryReviewRepository } from "Infrastructure/InMemory/Review/InMemoryReviewRepository";
import { MockTransactionManager } from "Application/shared/MockTransactionManager";
import { AddReviewService } from "./AddReviewService";

const BOOK_ID = "1234567890";

const makeBook = (bookId: string = BOOK_ID): Book =>
  Book.create(
    new BookIdentity(
      new BookId(bookId),
      new Title("テスト書籍"),
      new Author("テスト著者"),
    ),
    new Price({ amount: 1000, currency: "JPY" }),
  );

describe("AddReviewService", () => {
  let reviewRepository: InMemoryReviewRepository;
  let bookRepository: InMemoryBookRepository;
  let service: AddReviewService;

  beforeEach(async () => {
    reviewRepository = new InMemoryReviewRepository();
    bookRepository = new InMemoryBookRepository();
    service = new AddReviewService(
      reviewRepository,
      bookRepository,
      new MockTransactionManager(),
    );
    await bookRepository.save(makeBook());
  });

  it("コメントなしでレビューを追加し、DTOを返す", async () => {
    const result = await service.execute({
      bookId: BOOK_ID,
      name: "レビュアー",
      rating: 4,
    });

    expect(result.bookId).toBe(BOOK_ID);
    expect(result.name).toBe("レビュアー");
    expect(result.rating).toBe(4);
    expect(result.comment).toBeUndefined();
    expect(typeof result.id).toBe("string");
    expect(result.id.length).toBeGreaterThan(0);
  });

  it("コメントありでレビューを追加し、DTOにcommentが含まれる", async () => {
    const result = await service.execute({
      bookId: BOOK_ID,
      name: "レビュアー",
      rating: 5,
      comment: "とても良い本でした。",
    });

    expect(result.comment).toBe("とても良い本でした。");
  });

  it("レビューがリポジトリに保存される", async () => {
    const result = await service.execute({
      bookId: BOOK_ID,
      name: "レビュアー",
      rating: 3,
    });

    const saved = await reviewRepository.findById(
      { value: result.id } as any,
    );
    expect(saved).not.toBeNull();
  });

  it("存在しないbookIdを指定するとエラーをスローする", async () => {
    await expect(
      service.execute({
        bookId: "0000000000",
        name: "レビュアー",
        rating: 4,
      }),
    ).rejects.toThrow("Book with ID 0000000000 not found.");
  });
});
