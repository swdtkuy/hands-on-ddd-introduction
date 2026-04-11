import { Author } from "Domain/models/Book/Author/Author";
import { Book } from "Domain/models/Book/Book";
import { BookId } from "Domain/models/Book/BookId/BookId";
import { BookIdentity } from "Domain/models/Book/BookIdentity/BookIdentity";
import { IBookRepository } from "Domain/models/Book/IBookRepository";
import { Price } from "Domain/models/Book/Price/Price";
import { Title } from "Domain/models/Book/Title/Title";

import { SQLClientManager } from "../SQLClientManager";

type BookRow = {
  bookId: string;
  title: string;
  author: string;
  priceAmount: string;
  priceCurrency: string;
};

export class SQLBookRepository implements IBookRepository {
  constructor(private readonly clientManager: SQLClientManager) {}

  private toDomain(row: BookRow): Book {
    return Book.reconstruct(
      new BookIdentity(
        new BookId(row.bookId),
        new Title(row.title),
        new Author(row.author),
      ),
      new Price({
        amount: parseFloat(row.priceAmount),
        currency: row.priceCurrency as "JPY",
      }),
    );
  }

  async save(book: Book): Promise<void> {
    return await this.clientManager.withClient(async (client) => {
      const query = `
                INSERT INTO "Book" (
                    "bookId",
                    "title",
                    "author",
                    "priceAmount",
                    "priceCurrency"
                ) VALUES ($1, $2, $3, $4, $5)
            `;
      const values = [
        book.bookId.value,
        book.title.value,
        book.author.value,
        book.price.amount,
        book.price.currency,
      ];
      await client.query(query, values);
    });
  }

  async findById(bookId: BookId): Promise<Book | null> {
    return await this.clientManager.withClient(async (client) => {
      const query = `SELECT * FROM "Book" WHERE "bookId" = $1`;
      const result = await client.query(query, [bookId.value]);
      if (result.rows.length === 0) {
        return null;
      }
      return this.toDomain(result.rows[0]);
    });
  }
}
