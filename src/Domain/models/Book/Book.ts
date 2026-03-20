import { Author } from "./Author/Author";
import { BookId } from "./BookId/BookId";
import { BookIdentity } from "./BookIdentity/BookIdentity";
import { Price } from "./Price/Price";
import { Title } from "./Title/Title";

export class Book {
  private constructor(
    private readonly _identity: BookIdentity,
    private _price: Price,
  ) {}

  static create(identity: BookIdentity, price: Price): Book {
    return new Book(identity, price);
  }

  static reconstruct(identity: BookIdentity, price: Price): Book {
    return new Book(identity, price);
  }

  equals(other: Book): boolean {
    return this._identity.equals(other._identity);
  }

  get bookId(): BookId {
    return this._identity.bookId;
  }

  get title(): Title {
    return this._identity.title;
  }

  get author(): Author {
    return this._identity.author;
  }

  get price(): Price {
    return this._price;
  }

  changePrice(price: Price): void {
    this._price = price;
  }
}
