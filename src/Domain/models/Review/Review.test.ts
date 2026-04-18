import { BookId } from "../Book/BookId/BookId";
import { Comment } from "./Comment/Comment";
import { Name } from "./Name/Name";
import { Rating } from "./Rating/Rating";
import { Review } from "./Review";
import { ReviewId } from "./ReviewId/ReviewId";
import { ReviewIdentity } from "./ReviewIdentity/ReviewIdentity";

const makeIdentity = (id = "review-abc") =>
  new ReviewIdentity(new ReviewId(id));
const makeBookId = () => new BookId("9784123456789");
const makeName = (v = "山田 太郎") => new Name(v);
const makeRating = (v: number) => new Rating(v);
const makeComment = (v: string) => new Comment(v);
const longComment = "a".repeat(100);

describe("Review", () => {
  describe("create / reconstruct", () => {
    test("should expose all getters correctly", () => {
      const identity = makeIdentity();
      const bookId = makeBookId();
      const name = makeName();
      const rating = makeRating(4);
      const comment = makeComment("面白かった");

      const review = Review.create(identity, bookId, name, rating, comment);

      expect(review.reviewId).toBe(identity.reviewId);
      expect(review.bookId).toBe(bookId);
      expect(review.name).toBe(name);
      expect(review.rating).toBe(rating);
      expect(review.comment).toBe(comment);
    });

    test("should allow comment to be omitted", () => {
      const review = Review.create(
        makeIdentity(),
        makeBookId(),
        makeName(),
        makeRating(3),
      );
      expect(review.comment).toBeUndefined();
    });

    test("reconstruct should behave the same as create", () => {
      const identity = makeIdentity("review-xyz");
      const review = Review.reconstruct(
        identity,
        makeBookId(),
        makeName(),
        makeRating(5),
      );
      expect(review.reviewId).toBe(identity.reviewId);
    });

    test("create should add a ReviewCreated domain event", () => {
      const review = Review.create(
        makeIdentity(),
        makeBookId(),
        makeName(),
        makeRating(4),
        makeComment("面白かった"),
      );
      const events = review.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe("ReviewCreated");
    });

    test("reconstruct should not add any domain events", () => {
      const review = Review.reconstruct(
        makeIdentity(),
        makeBookId(),
        makeName(),
        makeRating(4),
      );
      expect(review.getDomainEvents()).toHaveLength(0);
    });
  });

  describe("isTrustworthy", () => {
    describe("without comment", () => {
      test("should return true when rating quality factor meets threshold", () => {
        // rating=4: factor=0.75 >= 0.6
        const review = Review.create(
          makeIdentity(),
          makeBookId(),
          makeName(),
          makeRating(4),
        );
        expect(review.isTrustworthy()).toBe(true);
      });

      test("should return false when rating quality factor is below threshold", () => {
        // rating=3: factor=0.5 < 0.6
        const review = Review.create(
          makeIdentity(),
          makeBookId(),
          makeName(),
          makeRating(3),
        );
        expect(review.isTrustworthy()).toBe(false);
      });

      test("should respect a custom threshold", () => {
        // rating=3: factor=0.5 >= 0.5
        const review = Review.create(
          makeIdentity(),
          makeBookId(),
          makeName(),
          makeRating(3),
        );
        expect(review.isTrustworthy(0.5)).toBe(true);
      });
    });

    describe("with comment", () => {
      test("should return true when combined factor meets threshold", () => {
        // rating=5 (1.0), comment>=100 chars (1.0): 1.0*0.7 + 1.0*0.3 = 1.0 >= 0.6
        const review = Review.create(
          makeIdentity(),
          makeBookId(),
          makeName(),
          makeRating(5),
          makeComment(longComment),
        );
        expect(review.isTrustworthy()).toBe(true);
      });

      test("should return false when combined factor is below threshold", () => {
        // rating=1 (0.0), comment<=10 chars (0.2): 0.0*0.7 + 0.2*0.3 = 0.06 < 0.6
        const review = Review.create(
          makeIdentity(),
          makeBookId(),
          makeName(),
          makeRating(1),
          makeComment("短い"),
        );
        expect(review.isTrustworthy()).toBe(false);
      });
    });
  });

  describe("extractRecommendedBooks", () => {
    test("should return empty array when there is no comment", () => {
      const review = Review.create(
        makeIdentity(),
        makeBookId(),
        makeName(),
        makeRating(3),
      );
      expect(review.extractRecommendedBooks()).toEqual([]);
    });

    test("should extract book titles from comment", () => {
      const review = Review.create(
        makeIdentity(),
        makeBookId(),
        makeName(),
        makeRating(4),
        makeComment(
          "『ドメイン駆動設計』を読む。「クリーンアーキテクチャ」もおすすめです。",
        ),
      );
      expect(review.extractRecommendedBooks()).toEqual(
        expect.arrayContaining(["ドメイン駆動設計", "クリーンアーキテクチャ"]),
      );
    });

    test("should return empty array when comment has no matching pattern", () => {
      const review = Review.create(
        makeIdentity(),
        makeBookId(),
        makeName(),
        makeRating(4),
        makeComment("特に参考文献はありません。"),
      );
      expect(review.extractRecommendedBooks()).toEqual([]);
    });

    test("should deduplicate repeated book titles", () => {
      const review = Review.create(
        makeIdentity(),
        makeBookId(),
        makeName(),
        makeRating(5),
        makeComment("『DDD本』を読む。やはり『DDD本』はおすすめです。"),
      );
      expect(review.extractRecommendedBooks()).toEqual(["DDD本"]);
    });
  });

  describe("mutations", () => {
    test("updateName should update the name", () => {
      const review = Review.create(
        makeIdentity(),
        makeBookId(),
        makeName("旧名前"),
        makeRating(3),
      );
      const newName = makeName("新名前");
      review.updateName(newName);
      expect(review.name).toBe(newName);
    });

    test("updateRating should update the rating", () => {
      const review = Review.create(
        makeIdentity(),
        makeBookId(),
        makeName(),
        makeRating(3),
      );
      const newRating = makeRating(5);
      review.updateRating(newRating);
      expect(review.rating).toBe(newRating);
    });

    test("editComment should update the comment", () => {
      const review = Review.create(
        makeIdentity(),
        makeBookId(),
        makeName(),
        makeRating(3),
      );
      const newComment = makeComment("編集後のコメント");
      review.editComment(newComment);
      expect(review.comment).toBe(newComment);
    });
  });

  describe("domain events", () => {
    test("updateName should add a ReviewNameUpdated event", () => {
      const review = Review.reconstruct(makeIdentity(), makeBookId(), makeName(), makeRating(3));
      review.updateName(makeName("新名前"));
      const events = review.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe("ReviewNameUpdated");
    });

    test("updateRating should add a ReviewRatingUpdated event", () => {
      const review = Review.reconstruct(makeIdentity(), makeBookId(), makeName(), makeRating(3));
      review.updateRating(makeRating(5));
      const events = review.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe("ReviewRatingUpdated");
    });

    test("editComment should add a ReviewCommentEdited event", () => {
      const review = Review.reconstruct(makeIdentity(), makeBookId(), makeName(), makeRating(3));
      review.editComment(makeComment("新コメント"));
      const events = review.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe("ReviewCommentEdited");
    });

    test("delete should add a ReviewDeleted event", () => {
      const review = Review.reconstruct(makeIdentity(), makeBookId(), makeName(), makeRating(3));
      review.delete();
      const events = review.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe("ReviewDeleted");
    });

    test("clearDomainEvents should remove all events", () => {
      const review = Review.create(makeIdentity(), makeBookId(), makeName(), makeRating(3));
      review.clearDomainEvents();
      expect(review.getDomainEvents()).toHaveLength(0);
    });
  });
});
