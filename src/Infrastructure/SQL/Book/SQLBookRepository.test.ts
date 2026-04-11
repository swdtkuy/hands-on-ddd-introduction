import { Book } from "Domain/models/Book/Book";
import { BookId } from "Domain/models/Book/BookId/BookId";
import { BookIdentity } from "Domain/models/Book/BookIdentity/BookIdentity";
import { Author } from "Domain/models/Book/Author/Author";
import { Title } from "Domain/models/Book/Title/Title";
import { Price } from "Domain/models/Book/Price/Price";

import { SQLClientManager } from "../SQLClientManager";
import { SQLBookRepository } from "./SQLBookRepository";

// Prevent db.ts from opening a real connection on import
jest.mock("pg", () => ({
  Pool: jest.fn().mockImplementation(() => ({ connect: jest.fn() })),
}));

const makeBook = ({
  bookId = "9784798126708",
  title = "ドメイン駆動設計",
  author = "エリック・エヴァンス",
  amount = 3300,
}: {
  bookId?: string;
  title?: string;
  author?: string;
  amount?: number;
} = {}): Book =>
  Book.reconstruct(
    new BookIdentity(new BookId(bookId), new Title(title), new Author(author)),
    new Price({ amount, currency: "JPY" }),
  );

const makeRow = ({
  bookId = "9784798126708",
  title = "ドメイン駆動設計",
  author = "エリック・エヴァンス",
  priceAmount = "3300",
  priceCurrency = "JPY",
}: {
  bookId?: string;
  title?: string;
  author?: string;
  priceAmount?: string;
  priceCurrency?: string;
} = {}) => ({ bookId, title, author, priceAmount, priceCurrency });

describe("SQLBookRepository", () => {
  let mockQuery: jest.Mock;
  let repository: SQLBookRepository;

  beforeEach(() => {
    mockQuery = jest.fn();
    const mockClient = { query: mockQuery } as any;
    const clientManager = {
      withClient: jest.fn((cb: (c: any) => Promise<any>) => cb(mockClient)),
    } as unknown as SQLClientManager;
    repository = new SQLBookRepository(clientManager);
  });

  describe("save", () => {
    test("should execute INSERT with correct values", async () => {
      mockQuery.mockResolvedValue({ rows: [], rowCount: 1 });
      const book = makeBook();

      await repository.save(book);

      const [sql, values] = mockQuery.mock.calls[0];
      expect(sql).toMatch(/INSERT INTO "Book"/i);
      expect(values).toEqual([
        book.bookId.value,
        book.title.value,
        book.author.value,
        book.price.amount,
        book.price.currency,
      ]);
    });
  });

  describe("findById", () => {
    test("should return null when no row is found", async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await repository.findById(new BookId("9784798126708"));

      expect(result).toBeNull();
    });

    test("should return a Book mapped from the row", async () => {
      const row = makeRow();
      mockQuery.mockResolvedValue({ rows: [row] });

      const result = await repository.findById(new BookId(row.bookId));

      expect(result).not.toBeNull();
      expect(result!.bookId.value).toBe(row.bookId);
      expect(result!.title.value).toBe(row.title);
      expect(result!.author.value).toBe(row.author);
      expect(result!.price.amount).toBe(parseFloat(row.priceAmount));
      expect(result!.price.currency).toBe(row.priceCurrency);
    });

    test("should pass bookId as the query parameter", async () => {
      mockQuery.mockResolvedValue({ rows: [] });
      const bookId = new BookId("9784798126708");

      await repository.findById(bookId);

      const [sql, values] = mockQuery.mock.calls[0];
      expect(sql).toMatch(/"Book"/);
      expect(values).toEqual(["9784798126708"]);
    });
  });
});
