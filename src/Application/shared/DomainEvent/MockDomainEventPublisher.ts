import { DomainEvent } from "Domain/shared/DomainEvent/DomainEvent";

import { IDomainEventPublisher } from "Application/shared/DomainEvent/IDomainEventPublisher";

export class MockDomainEventPublisher implements IDomainEventPublisher {
  private _publishedEvents: DomainEvent[] = [];

  publish(domainEvent: DomainEvent): void {
    this._publishedEvents.push(domainEvent);
  }

  getPublishedEvents(): DomainEvent[] {
    return this._publishedEvents;
  }
}
