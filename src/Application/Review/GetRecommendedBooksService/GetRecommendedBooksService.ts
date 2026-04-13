import { BookId } from "Domain/models/Book/BookId/BookId";
import { IReviewRepository } from "Domain/models/Review/IReviewRepository";
import { BookRecommendationDomainService } from "Domain/services/Review/BookRecommendationDomainService/BookRecommendationDomainService";
import { inject, injectable } from "tsyringe";
import { GetRecommendedBooksDTO } from "./GetRecommendedBooksDTO";

export type GetRecommendedBooksCommand = {
  bookId: string;
  maxCount?: number;
};

@injectable()
export class GetRecommendedBooksService {
  private bookRecommendationService: BookRecommendationDomainService;

  constructor(
    @inject("IReviewRepository") private reviewRepository: IReviewRepository,
  ) {
    this.bookRecommendationService = new BookRecommendationDomainService();
  }

  async execute(
    command: GetRecommendedBooksCommand,
  ): Promise<GetRecommendedBooksDTO> {
    const bookId = new BookId(command.bookId);
    const reviews = await this.reviewRepository.findAllByBookId(bookId);

    const recommendedBooks =
      this.bookRecommendationService.calculateTopRecommendedBooks(
        reviews,
        command.maxCount,
      );
    return {
      sourceBookId: command.bookId,
      recommendedBooks: recommendedBooks,
    };
  }
}
