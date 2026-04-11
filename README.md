# CatalogService

書籍「[つくりながら学ぶ！ ドメイン駆動設計 実践入門](https://book.mynavi.jp/ec/products/detail/id=149226)」（山下祐也 著 / 増田亨 監修）の学習用実装コード

## 技術スタック

- **言語**: TypeScript 5.x（strict モード）
- **ランタイム**: Node.js 24.x
- **テスト**: Jest + ts-jest
- **DB**: PostgreSQL 15（Docker Compose）

## 動作確認

### サーバー起動

```bash
# DB起動
docker compose up -d

# マイグレーション（初回のみ）
npx ts-node src/Infrastructure/SQL/migrations/runMigrations.ts init.sql

# サーバー起動（ポート3000）
npx ts-node src/Presentation/Express/index.ts
```

### APIエンドポイント

```bash
# 書籍登録
curl -X POST http://localhost:3000/book \
  -H "Content-Type: application/json" \
  -d '{"isbn":"9784839974084","title":"ドメイン駆動設計 実践入門","author":"山下祐也","price":3278}'

# レビュー追加
curl -X POST http://localhost:3000/book/9784839974084/review \
  -H "Content-Type: application/json" \
  -d '{"name":"太郎","rating":5,"comment":"わかりやすい本でした。"}'

# おすすめ書籍取得
curl http://localhost:3000/book/9784839974084/recommendations

# レビュー編集
curl -X PUT http://localhost:3000/review/{reviewId} \
  -H "Content-Type: application/json" \
  -d '{"name":"太郎","rating":4,"comment":"とても参考になりました。"}'

# レビュー削除
curl -X DELETE http://localhost:3000/review/{reviewId}
```
