import { container } from "tsyringe";
import { BookId } from "Domain/models/Book/BookId/BookId";
import { InMemoryBookRepository } from "Infrastructure/InMemory/Book/InMemoryBookRepository";
import { RegisterBookService } from "./RegisterBookService";

const VALID_ISBN = "1234567890";
const VALID_TITLE = "ドメイン駆動設計";
const VALID_AUTHOR = "著者名";
const VALID_PRICE = 3000;

describe("RegisterBookService", () => {
  let repository: InMemoryBookRepository;
  let service: RegisterBookService;

  beforeEach(() => {
    service = container.resolve(RegisterBookService);
    repository = service["bookRepository"] as InMemoryBookRepository;
  });

  it("有効なコマンドで書籍を登録できる", async () => {
    await service.execute({
      isbn: VALID_ISBN,
      title: VALID_TITLE,
      author: VALID_AUTHOR,
      price: VALID_PRICE,
    });

    const saved = await repository.findById(new BookId(VALID_ISBN));
    expect(saved).not.toBeNull();
    expect(saved!.bookId.value).toBe(VALID_ISBN);
    expect(saved!.title.value).toBe(VALID_TITLE);
    expect(saved!.author.value).toBe(VALID_AUTHOR);
    expect(saved!.price.amount).toBe(VALID_PRICE);
    expect(saved!.price.currency).toBe("JPY");
  });

  it("同じISBNの書籍が既に存在する場合はエラーになる", async () => {
    await service.execute({
      isbn: VALID_ISBN,
      title: VALID_TITLE,
      author: VALID_AUTHOR,
      price: VALID_PRICE,
    });

    await expect(
      service.execute({
        isbn: VALID_ISBN,
        title: "別タイトル",
        author: VALID_AUTHOR,
        price: VALID_PRICE,
      }),
    ).rejects.toThrow(`Book with ISBN ${VALID_ISBN} already exists.`);
  });

});
