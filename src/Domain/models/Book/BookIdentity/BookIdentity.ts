import { Author } from "../Author/Author";
import { BookId } from "../BookId/BookId";
import { Title } from "../Title/Title";

export class BookIdentity {
    constructor(
        private readonly _bookId: BookId,
        private readonly _title: Title,
        private readonly _author: Author
    ) {}

    equals(other: BookIdentity): boolean {
        return this._bookId.equals(other._bookId);
    }

    get bookId(): BookId {
        return this._bookId;
    }

    get title(): Title {
        return this._title;
    }

    get author(): Author {
        return this._author;
    }
}