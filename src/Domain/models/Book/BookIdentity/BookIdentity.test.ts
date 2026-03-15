import { Author } from "../Author/Author";
import { BookId } from "../BookId/BookId";
import { Title } from "../Title/Title";
import { BookIdentity } from "./BookIdentity";

describe("BookIdentity", () => {
    const bookId = new BookId("9784798126708");
    const title = new Title("ドメイン駆動設計");
    const author = new Author("エリック・エヴァンス");
    const identity = new BookIdentity(bookId, title, author);

    test("should expose bookId via getter", () => {
        expect(identity.bookId).toBe(bookId);
    });

    test("should expose title via getter", () => {
        expect(identity.title).toBe(title);
    });

    test("should expose author via getter", () => {
        expect(identity.author).toBe(author);
    });

    test("should be equal when bookIds are the same", () => {
        const other = new BookIdentity(
            new BookId("9784798126708"),
            new Title("別のタイトル"),
            new Author("別の著者")
        );
        expect(identity.equals(other)).toBe(true);
    });

    test("should not be equal when bookIds differ", () => {
        const other = new BookIdentity(
            new BookId("9791032317785"),
            title,
            author
        );
        expect(identity.equals(other)).toBe(false);
    });
});
