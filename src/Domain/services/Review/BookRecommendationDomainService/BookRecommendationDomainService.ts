import { Review } from "Domain/models/Review/Review";

export class BookRecommendationDomainService {
  constructor() {}

  getTrustworthyReviews(reviews: Review[]): Review[] {
    return reviews.filter((review) => review.isTrustworthy());
  }

  calculateTopRecommendedBooks(
    reviews: Review[],
    maxCount: number = 3,
  ): string[] {
    const trustworthyReviews = this.getTrustworthyReviews(reviews);

    const recommendedBooks = trustworthyReviews.reduce(
      (acc, review) => {
        const bookTitles = review.extractRecommendedBooks();
        bookTitles.forEach((title) => {
          acc[title] = (acc[title] || 0) + 1;
        });
        return acc;
      },
      {} as { [title: string]: number },
    );

    return Object.entries(recommendedBooks)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxCount)
      .map((entry) => entry[0]);
  }
}
