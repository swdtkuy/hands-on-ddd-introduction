import { ITransactionManager } from "Application/shared/ITransactionManager";
import { IReviewRepository } from "Domain/models/Review/IReviewRepository";
import { ReviewId } from "Domain/models/Review/ReviewId/ReviewId";

export type DeleteReviewCommand = {
  reviewId: string;
};

export class DeleteReviewService {
  constructor(
    private reviewRepository: IReviewRepository,
    private transactionManager: ITransactionManager,
  ) {}

  async execute(command: DeleteReviewCommand): Promise<void> {
    await this.transactionManager.begin(async () => {
      const reviewId = new ReviewId(command.reviewId);
      const review = await this.reviewRepository.findById(reviewId);
      if (!review) {
        throw new Error(`Review with ID ${command.reviewId} not found.`);
      }

      await this.reviewRepository.delete(reviewId);
    });
  }
}
