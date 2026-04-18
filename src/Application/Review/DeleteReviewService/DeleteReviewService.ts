import { IDomainEventPublisher } from "Application/shared/DomainEvent/IDomainEventPublisher";
import { ITransactionManager } from "Application/shared/ITransactionManager";
import { IReviewRepository } from "Domain/models/Review/IReviewRepository";
import { ReviewId } from "Domain/models/Review/ReviewId/ReviewId";
import { inject, injectable } from "tsyringe";

export type DeleteReviewCommand = {
  reviewId: string;
};

@injectable()
export class DeleteReviewService {
  constructor(
    @inject("IReviewRepository") private reviewRepository: IReviewRepository,
    @inject("ITransactionManager")
    private transactionManager: ITransactionManager,
    @inject("IDomainEventPublisher")
    private domainEventPublisher: IDomainEventPublisher,
  ) {}

  async execute(command: DeleteReviewCommand): Promise<void> {
    const review = await this.transactionManager.begin(async () => {
      const reviewId = new ReviewId(command.reviewId);
      const review = await this.reviewRepository.findById(reviewId);
      if (!review) {
        throw new Error(`Review with ID ${command.reviewId} not found.`);
      }

      review.delete();

      await this.reviewRepository.delete(reviewId);
      return review;
    });

    const events = review.getDomainEvents();
    events.forEach((event) => this.domainEventPublisher.publish(event));
    review.clearDomainEvents();
  }
}
