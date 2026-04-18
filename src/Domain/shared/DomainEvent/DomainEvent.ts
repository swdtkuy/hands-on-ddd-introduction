import { nanoid } from "nanoid";

// ドメインで発生したことに関連する情報を保持する
export class DomainEvent<
  Type extends string = string,
  Body extends Record<string, unknown> = Record<string, unknown>,
> {
  // ドメインイベントは「過去に発生した出来事」を表現するため、
  // すべてのプロパティは読み取り専用（readonly）で定義する
  private constructor(
    // 同じイベントが重複して処理されることを防ぐ
    public readonly eventId: string,
    // ドメインイベントが発生した集約のID
    // 書籍のIDや注文のID
    public readonly aggregateId: string,
    // ドメインイベントが発生した集約の種類
    // ドメインイベントがどの集約に関連するのかを識別
    // 「Book」や「Review」
    public readonly aggregateType: string,
    // ドメインイベントが表すビジネス上の出来事を表現する名前
    // 作成：{ 集約名 }Created
    // 更新：{ 集約名 }{ 項目名 }Updated
    // 追加：{ 項目名 }AddedTo{ 集約名 }
    // 削除：{ 項目名 }RemovedFrom{ 集約名 }
    public readonly eventType: Type,
    // ドメインイベントに関連する具体的なデータを保持するオブジェクト
    public readonly eventBody: Body,
    // ドメインイベントが発生した日時
    public readonly occurredAt: Date,
  ) {}

  public static create<
    Type extends string,
    Body extends Record<string, unknown>,
  >(
    aggregateId: string,
    aggregateType: string,
    eventType: Type,
    eventBody: Body,
  ): DomainEvent<Type, Body> {
    return new DomainEvent(
      nanoid(),
      aggregateId,
      aggregateType,
      eventType,
      eventBody,
      new Date(),
    );
  }

  static reconstruct<Type extends string, Body extends Record<string, unknown>>(
    eventId: string,
    aggregateId: string,
    aggregateType: string,
    eventType: Type,
    eventBody: Body,
    occurredOn: Date,
  ): DomainEvent<Type, Body> {
    return new DomainEvent(
      eventId,
      aggregateId,
      aggregateType,
      eventType,
      eventBody,
      occurredOn,
    );
  }
}
