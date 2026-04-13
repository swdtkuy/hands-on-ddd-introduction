import { container } from "tsyringe";

import { MockTransactionManager } from "Application/shared/MockTransactionManager";
import { InMemoryBookRepository } from "Infrastructure/InMemory/Book/InMemoryBookRepository";
import { InMemoryReviewRepository } from "Infrastructure/InMemory/Review/InMemoryReviewRepository";

// Repositories
container.register("IBookRepository", { useClass: InMemoryBookRepository });
container.register("IReviewRepository", { useClass: InMemoryReviewRepository });

// Transaction Manager
container.register("ITransactionManager", {
  useClass: MockTransactionManager,
});
