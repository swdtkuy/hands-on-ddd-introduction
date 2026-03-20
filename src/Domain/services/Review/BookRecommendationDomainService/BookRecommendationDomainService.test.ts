import { Review } from "Domain/models/Review/Review";
import { BookId } from "Domain/models/Book/BookId/BookId";
import { Comment } from "Domain/models/Review/Comment/Comment";
import { Name } from "Domain/models/Review/Name/Name";
import { Rating } from "Domain/models/Review/Rating/Rating";
import { ReviewId } from "Domain/models/Review/ReviewId/ReviewId";
import { ReviewIdentity } from "Domain/models/Review/ReviewIdentity/ReviewIdentity";
import { BookRecommendationDomainService } from "./BookRecommendationDomainService";

const makeIdentity = (id: string) =>
  new ReviewIdentity(new ReviewId(id));

const bookId = new BookId("1234567890");
const name = new Name("テスト太郎");

// Rating 4 (qualityFactor=0.75) → trustworthy without comment
const trustworthyRating = new Rating(4);
// Rating 3 (qualityFactor=0.50) → not trustworthy without comment
const untrustworthyRating = new Rating(3);

const makeReview = (
  id: string,
  rating: Rating,
  comment?: Comment,
): Review =>
  Review.create(makeIdentity(id), bookId, name, rating, comment);

// Comment that references a book title and contains a trigger word
const commentWithBook = (title: string) =>
  new Comment(`『${title}』はとてもおすすめです。ぜひ読んでみてください。`);

describe("BookRecommendationDomainService", () => {
  let service: BookRecommendationDomainService;

  beforeEach(() => {
    service = new BookRecommendationDomainService();
  });

  describe("getTrustworthyReviews", () => {
    it("空のリストを渡すと空のリストを返す", () => {
      expect(service.getTrustworthyReviews([])).toEqual([]);
    });

    it("信頼できるレビューのみを返す", () => {
      const trustworthy = makeReview("r1", trustworthyRating);
      const untrustworthy = makeReview("r2", untrustworthyRating);

      const result = service.getTrustworthyReviews([trustworthy, untrustworthy]);

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(trustworthy);
    });

    it("すべて信頼できる場合は全件返す", () => {
      const reviews = [
        makeReview("r1", trustworthyRating),
        makeReview("r2", new Rating(5)),
      ];

      expect(service.getTrustworthyReviews(reviews)).toHaveLength(2);
    });

    it("すべて信頼できない場合は空のリストを返す", () => {
      const reviews = [
        makeReview("r1", untrustworthyRating),
        makeReview("r2", new Rating(1)),
      ];

      expect(service.getTrustworthyReviews(reviews)).toHaveLength(0);
    });
  });

  describe("calculateTopRecommendedBooks", () => {
    it("空のリストを渡すと空のリストを返す", () => {
      expect(service.calculateTopRecommendedBooks([])).toEqual([]);
    });

    it("信頼できるレビューがない場合は空のリストを返す", () => {
      const reviews = [makeReview("r1", untrustworthyRating, commentWithBook("DDD入門"))];

      expect(service.calculateTopRecommendedBooks(reviews)).toEqual([]);
    });

    it("信頼できるレビューからのみ書籍を抽出する", () => {
      const trustworthy = makeReview("r1", trustworthyRating, commentWithBook("DDD入門"));
      const untrustworthy = makeReview("r2", untrustworthyRating, commentWithBook("除外本"));

      const result = service.calculateTopRecommendedBooks([trustworthy, untrustworthy]);

      expect(result).toContain("DDD入門");
      expect(result).not.toContain("除外本");
    });

    it("複数レビューにまたがって同じ書籍の推薦数を集計する", () => {
      const reviews = [
        makeReview("r1", trustworthyRating, commentWithBook("人気本")),
        makeReview("r2", trustworthyRating, commentWithBook("人気本")),
        makeReview("r3", trustworthyRating, commentWithBook("普通本")),
      ];

      const result = service.calculateTopRecommendedBooks(reviews);

      expect(result[0]).toBe("人気本");
    });

    it("推薦数が多い順に並べて返す", () => {
      const reviews = [
        makeReview("r1", trustworthyRating, commentWithBook("1位本")),
        makeReview("r2", trustworthyRating, commentWithBook("1位本")),
        makeReview("r3", trustworthyRating, commentWithBook("1位本")),
        makeReview("r4", trustworthyRating, commentWithBook("2位本")),
        makeReview("r5", trustworthyRating, commentWithBook("2位本")),
        makeReview("r6", trustworthyRating, commentWithBook("3位本")),
      ];

      const result = service.calculateTopRecommendedBooks(reviews);

      expect(result).toEqual(["1位本", "2位本", "3位本"]);
    });

    it("デフォルトで最大3件を返す", () => {
      const reviews = ["A", "B", "C", "D"].map((title, i) =>
        makeReview(`r${i}`, trustworthyRating, commentWithBook(title)),
      );

      expect(service.calculateTopRecommendedBooks(reviews)).toHaveLength(3);
    });

    it("maxCountを指定するとその件数で上限を制限する", () => {
      const reviews = ["A", "B", "C", "D", "E"].map((title, i) =>
        makeReview(`r${i}`, trustworthyRating, commentWithBook(title)),
      );

      expect(service.calculateTopRecommendedBooks(reviews, 2)).toHaveLength(2);
    });

    it("結果がmaxCount未満の場合は実際の件数を返す", () => {
      const reviews = [makeReview("r1", trustworthyRating, commentWithBook("唯一本"))];

      expect(service.calculateTopRecommendedBooks(reviews, 5)).toHaveLength(1);
    });

    it("コメントなしのレビューは書籍を抽出しない", () => {
      const reviewWithoutComment = makeReview("r1", trustworthyRating);

      expect(service.calculateTopRecommendedBooks([reviewWithoutComment])).toEqual([]);
    });
  });
});
