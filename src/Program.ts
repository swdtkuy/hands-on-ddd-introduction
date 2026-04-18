import { container } from "tsyringe";

import { EventEmitterDomainEventPublisher } from "Infrastructure/EventEmitter/EventEmitterDomainEventPublisher";
import { EventEmitterDomainEventSubscriber } from "Infrastructure/EventEmitter/EventEmitterDomainEventSubscriber";

import { SQLBookRepository } from "Infrastructure/SQL/Book/SQLBookRepository";
import { SQLReviewRepository } from "Infrastructure/SQL/Review/SQLReviewRepository";
import { SQLTransactionManager } from "Infrastructure/SQL/SQLTransactionManager";

// Repositories
container.register("IBookRepository", { useClass: SQLBookRepository });
container.register("IReviewRepository", { useClass: SQLReviewRepository });

// Transaction Manager
container.register("ITransactionManager", {
  useClass: SQLTransactionManager,
});

// Domain Event Publisher & Subscriber
container.register("IDomainEventPublisher", {
  useClass: EventEmitterDomainEventPublisher,
});
container.register("IDomainEventSubscriber", {
  useClass: EventEmitterDomainEventSubscriber,
});
