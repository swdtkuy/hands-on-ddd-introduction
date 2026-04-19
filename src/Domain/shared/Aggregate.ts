import { DomainEvent } from "./DomainEvent/DomainEvent";

// ドメインイベント記録用の基底クラス
// すべての集約はこのクラスを継承して、ドメインイベントを記録できるようにする
// ドメインイベントの発行は、集約の永続化が成功した後に別で行う
export abstract class Aggregate<Event extends DomainEvent> {
  domainEvents: Event[] = [];

  protected addDomainEvent(domainEvent: Event) {
    this.domainEvents.push(domainEvent);
  }

  getDomainEvents(): Event[] {
    return this.domainEvents;
  }

  clearDomainEvents() {
    this.domainEvents = [];
  }
}
