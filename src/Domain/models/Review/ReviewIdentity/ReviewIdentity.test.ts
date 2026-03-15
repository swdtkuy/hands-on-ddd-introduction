import { ReviewId } from "../ReviewId/ReviewId";
import { ReviewIdentity } from "./ReviewIdentity";

describe("ReviewIdentity", () => {
  const id = new ReviewId("review-1");
  const identity = new ReviewIdentity(id);

  test("should expose reviewId via getter", () => {
    expect(identity.reviewId).toBe(id);
  });

  test("should be equal when reviewIds are the same", () => {
    const other = new ReviewIdentity(new ReviewId("review-1"));
    expect(identity.equals(other)).toBe(true);
  });

  test("should not be equal when reviewIds differ", () => {
    const other = new ReviewIdentity(new ReviewId("review-2"));
    expect(identity.equals(other)).toBe(false);
  });
});
