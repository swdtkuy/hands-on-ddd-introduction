# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Learning implementation of Domain-Driven Design patterns, based on the book "つくりながら学ぶ！ ドメイン駆動設計 実践入門". TypeScript 5.x with strict mode, Node.js 24.x.

## Commands

```bash
# Run all tests
npx jest

# Run a single test file
npx jest src/Domain/models/Book/Title/Title.test.ts

# Run tests matching a pattern
npx jest --testNamePattern="should create a valid"

# Lint
npm run lint
npm run lint:fix

# Format
npm run format
npm run format:check

# Start local PostgreSQL
docker compose up -d

# Run DB migration
npx ts-node src/Infrastructure/SQL/migrations/runMigrations.ts init.sql
```

## Architecture

Code is organized into four layers under `src/`:

### Domain (`src/Domain/`)

- **`shared/ValueObject.ts`** — Abstract base class for all value objects. Uses phantom types (`_type: U`) for compile-time type safety, lodash `isEqual` for deep equality, and enforces a `validate()` method on subclasses that throws on invalid input.
- **`models/Book/`** — Book aggregate: `BookId` (ISBN-10/13), `Title`, `Author`, `Price` (JPY only, 1–1,000,000), `BookIdentity` (equality by bookId). `IBookRepository` defines `save` and `findById`.
- **`models/Review/`** — Review aggregate: `ReviewId` (nanoid-generated), `Rating` (1–5 integer), `Comment` (1–1000 chars, exposes `getQualityFactor()`), `Name`, `ReviewIdentity` (equality by reviewId). `Review` aggregate root exposes `isTrustworthy()` and `extractRecommendedBooks()`. `IReviewRepository` defines `save`, `update`, `delete`, `findById`, and `findAllByBookId`.
- **`services/`** — Stateless domain services for cross-aggregate logic. `BookRecommendationDomainService` filters trustworthy reviews and ranks recommended book titles by mention count.

### Application (`src/Application/`)

Application services accept a plain command/DTO object and call `execute()`. All application services are decorated with `@injectable()` and receive dependencies via `@inject("IBookRepository")` / `@inject("IReviewRepository")` / `@inject("ITransactionManager")` — resolved through the **tsyringe** DI container.

- **`Book/RegisterBookService/`** — Checks for duplicate ISBN, constructs the Book aggregate, persists it.
- **`Review/AddReviewService/`** — Creates and persists a new Review for a Book.
- **`Review/EditReviewService/`** — Updates rating/comment on an existing Review.
- **`Review/DeleteReviewService/`** — Deletes a Review by id.
- **`Review/GetRecommendedBooksService/`** — Delegates to `BookRecommendationDomainService` to rank recommended titles across all reviews for a book.
- **`shared/ITransactionManager.ts`** — `begin<T>(callback)` interface for wrapping operations in a transaction.
- **`shared/MockTransactionManager.ts`** — Test double that executes the callback directly (no real transaction).

### Infrastructure (`src/Infrastructure/`)

- **`SQL/`** — PostgreSQL via `pg`. `SQLClientManager` uses `AsyncLocalStorage` to propagate a `PoolClient` through a call tree, enabling repositories to share a transaction-scoped client without explicit passing. `SQLTransactionManager` implements `ITransactionManager` on top of it.
- **`SQL/Book/` and `SQL/Review/`** — `SQLBookRepository` and `SQLReviewRepository` implement the domain repository interfaces. Both use `SQLClientManager.withClient()`.
- **`SQL/migrations/`** — `init.sql` creates the `Book` and `Review` tables (PostgreSQL); `runMigrations.ts` runs a named SQL file against the pool.
- **`InMemory/`** — `InMemoryBookRepository` and `InMemoryReviewRepository` for use in unit tests.

### Presentation (`src/Presentation/`)

- **`Express/index.ts`** — Express 5 HTTP server on port 3000. Resolves services from the tsyringe container (bootstrapped by `src/Program.ts`). Routes: `POST /book`, `POST /book/:isbn/review`, `PUT /review/:reviewId`, `DELETE /review/:reviewId`, `GET /book/:isbn/recommendations`, `GET /db/state` (returns current DB contents as JSON). Start with `npx ts-node -r tsconfig-paths/register src/Presentation/Express/index.ts`.
- **`Express/public/index.html`** — Interactive web UI served at `http://localhost:3000`. Provides a request builder for all API endpoints and a live database state viewer.

Path aliases are configured so imports use `Domain/...`, `Application/...`, and `Infrastructure/...` instead of relative paths.

## Dependency Injection

**tsyringe** is the DI container. Two composition roots exist:

- **`src/Program.ts`** — registers SQL implementations (production).
- **`src/TestProgram.ts`** — registers in-memory repositories and `MockTransactionManager` (tests).

`setupJest.ts` (loaded by Jest via `setupFilesAfterEnv`) imports `reflect-metadata` and `src/TestProgram.ts`, so the test container is always configured before any test runs. The Presentation layer bootstraps via `Program.ts`; `reflect-metadata` must be imported before any decorated class is instantiated.

## Database

`docker-compose.yaml` runs Postgres 15 on port 5432 with `localdb` / `postgres` / `password`. The same defaults are hardcoded in `src/Infrastructure/SQL/db.ts` and can be overridden via `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT` env vars.

## Aggregate Design Decisions

- **Book**: identity by `BookId` (ISBN). `Book.create()` for new instances, `Book.reconstruct()` for loading from persistence. `changePrice()` is the only mutation.
- **Review**: references `BookId` but does not own the Book aggregate. `isTrustworthy(threshold)` weights rating (70%) and comment quality (30%) when a comment is present. `extractRecommendedBooks()` uses a Japanese-text regex to pull book titles from comments.
- **Cross-aggregate logic** belongs in domain services, not aggregates.

## Testing Conventions

Test files sit alongside source files (`*.test.ts`). Tests cover boundary values (MIN/MAX), error cases, and behavioral methods. Phantom type bypasses in tests use `as any` (allowed by ESLint config for test files).

Do not duplicate tests for behavior already covered by the parent `ValueObject` class (e.g., `equals()`) in subclass test files.

Infrastructure repository tests (`SQL/**/*.test.ts`) mock `pg` at the module level (`jest.mock("pg", ...)`) to prevent real DB connections and inject a mock `SQLClientManager` directly.
