import { IDomainEventSubscriber } from "Application/shared/DomainEvent/IDomainEventSubscriber";
import { inject, injectable } from "tsyringe";

@injectable()
export class CatalogServiceEventHandler {
  constructor(
    @inject("IDomainEventSubscriber")
    private subscriber: IDomainEventSubscriber,
  ) {}

  register() {
    this.subscriber.subscribe(
      "CatalogService",
      (event: Record<string, unknown>) => {
        this.handleDomainEvent(event);
      },
    );
  }

  private handleDomainEvent(event: Record<string, unknown>) {
    switch (event.eventType) {
      case "ReviewCreated":
        console.log(
          `Created new review. Review ID: ${event.aggregateId}, Book ID: ${(event.eventBody as Record<string, unknown>).bookId}`,
        );
        break;
    }
  }
}
