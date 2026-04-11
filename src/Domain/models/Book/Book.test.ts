import { Author } from "./Author/Author";
import { Book } from "./Book";
import { BookId } from "./BookId/BookId";
import { BookIdentity } from "./BookIdentity/BookIdentity";
import { Price } from "./Price/Price";
import { Title } from "./Title/Title";

const makeIdentity = (isbn = "9784798126708") =>
  new BookIdentity(
    new BookId(isbn),
    new Title("ドメイン駆動設計"),
    new Author("エリック・エヴァンス"),
  );

const makePrice = (amount = 3300) => new Price({ amount, currency: "JPY" });

describe("Book", () => {
  describe("create", () => {
    test("should create a Book with given identity and price", () => {
      const identity = makeIdentity();
      const price = makePrice();
      const book = Book.create(identity, price);

      expect(book.bookId).toBe(identity.bookId);
      expect(book.title).toBe(identity.title);
      expect(book.author).toBe(identity.author);
      expect(book.price).toBe(price);
    });
  });

  describe("reconstruct", () => {
    test("should reconstruct a Book with given identity and price", () => {
      const identity = makeIdentity();
      const price = makePrice();
      const book = Book.reconstruct(identity, price);

      expect(book.bookId).toBe(identity.bookId);
      expect(book.price).toBe(price);
    });
  });

  describe("equals", () => {
    test("should be equal when bookIds are the same", () => {
      const book1 = Book.create(makeIdentity("9784798126708"), makePrice(1000));
      const book2 = Book.create(makeIdentity("9784798126708"), makePrice(2000));
      expect(book1.equals(book2)).toBe(true);
    });

    test("should not be equal when bookIds differ", () => {
      const book1 = Book.create(makeIdentity("9784798126708"), makePrice());
      const book2 = Book.create(makeIdentity("9791032317785"), makePrice());
      expect(book1.equals(book2)).toBe(false);
    });
  });

  describe("changePrice", () => {
    test("should update the price", () => {
      const book = Book.create(makeIdentity(), makePrice(1000));
      const newPrice = makePrice(2000);
      book.changePrice(newPrice);
      expect(book.price).toBe(newPrice);
    });
  });
});
