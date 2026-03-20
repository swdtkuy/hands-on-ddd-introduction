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
```

## Architecture

All code lives under `src/Domain/` and follows DDD patterns:

- **`shared/ValueObject.ts`** — Abstract base class for all value objects. Uses phantom types (`_type: U`) for compile-time type safety, lodash `isEqual` for deep equality, and enforces a `validate()` method on subclasses that throws on invalid input.

- **`models/Book/`** — Book aggregate value objects: `BookId` (ISBN-10/13), `Title`, `Author`, `Price` (JPY only, 1–1,000,000), and `BookIdentity` (aggregates them, equality by bookId).

- **`models/Review/`** — Review aggregate value objects: `ReviewId` (nanoid-generated), `Rating` (1–5 integer), `Comment` (1–1000 chars, exposes `getQualityFactor()`), `Name`, and `ReviewIdentity` (aggregates them, equality by reviewId). `Review` aggregate root exposes `isTrustworthy()` and `extractRecommendedBooks()`.

- **`services/`** — Stateless domain services that coordinate logic across aggregates. `services/Review/BookRecommendationDomainService/` operates on `Review[]` to filter trustworthy reviews and rank recommended book titles by mention count.

Path aliases are configured so imports use `Domain/...` instead of relative paths (e.g., `import { ValueObject } from "Domain/shared/ValueObject"`).

## Aggregate Design Decisions

- **Book**: identity by `BookId` (ISBN). `Book.create()` for new instances, `Book.reconstruct()` for loading from persistence. `changePrice()` is the only mutation.
- **Review**: references `BookId` but does not own the Book aggregate. `isTrustworthy(threshold)` weights rating (70%) and comment quality (30%) when a comment is present. `extractRecommendedBooks()` uses a Japanese-text regex to pull book titles from comments.
- **Cross-aggregate logic** belongs in domain services, not aggregates.

## Testing Conventions

Test files sit alongside source files (`*.test.ts`). Tests cover boundary values (MIN/MAX), error cases, and behavioral methods. Phantom type bypasses in tests use `as any` (allowed by ESLint config for test files).

Do not duplicate tests for behavior already covered by the parent `ValueObject` class (e.g., `equals()`) in subclass test files.
