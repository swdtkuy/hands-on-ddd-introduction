import express, { json, Response } from "express";
import path from "path";

import {
  RegisterBookCommand,
  RegisterBookService,
} from "Application/Book/RegisterBookService/RegisterBookService";
import {
  AddReviewCommand,
  AddReviewService,
} from "Application/Review/AddReviewService/AddReviewService";
import {
  DeleteReviewCommand,
  DeleteReviewService,
} from "Application/Review/DeleteReviewService/DeleteReviewService";
import {
  EditReviewCommand,
  EditReviewService,
} from "Application/Review/EditReviewService/EditReviewService";
import {
  GetRecommendedBooksCommand,
  GetRecommendedBooksService,
} from "Application/Review/GetRecommendedBooksService/GetRecommendedBooksService";
import { SQLBookRepository } from "Infrastructure/SQL/Book/SQLBookRepository";
import { SQLReviewRepository } from "Infrastructure/SQL/Review/SQLReviewRepository";
import { SQLClientManager } from "Infrastructure/SQL/SQLClientManager";
import { SQLTransactionManager } from "Infrastructure/SQL/SQLTransactionManager";
import pool from "Infrastructure/SQL/db";

const app = express();
const port = 3000;

app.use(json());
app.use(express.static(path.join(__dirname, "public")));

const clientManager = new SQLClientManager();
const transactionManager = new SQLTransactionManager(clientManager);
const bookRepository = new SQLBookRepository(clientManager);
const reviewRepository = new SQLReviewRepository(clientManager);

const isStr = (v: unknown): v is string => typeof v === "string" && v.length > 0;
const isNum = (v: unknown): v is number => typeof v === "number" && !isNaN(v);
const invalid = (res: Response) =>
  res.status(400).json({ ok: false, message: "Invalid request" });

app.get("/db/state", async (_req, res) => {
  try {
    const booksResult = await pool.query('SELECT * FROM "Book" ORDER BY "bookId"');
    const reviewsResult = await pool.query('SELECT * FROM "Review" ORDER BY "bookId", "reviewId"');
    res.json({ ok: true, books: booksResult.rows, reviews: reviewsResult.rows });
  } catch {
    res.status(503).json({
      ok: false,
      message: 'DBに接続できません。docker compose up -d で起動してください。',
    });
  }
});

app.get("/book/:isbn/recommendations", async (req, res) => {
  try {
    const { isbn } = req.params;
    const { maxCount } = req.query;
    if (!isStr(isbn) || (maxCount !== undefined && !isNum(Number(maxCount))))
      return invalid(res);

    const service = new GetRecommendedBooksService(reviewRepository);
    const command: GetRecommendedBooksCommand = {
      bookId: isbn,
      maxCount: maxCount !== undefined ? Number(maxCount) : undefined,
    };

    const recommendations = await service.execute(command);
    res.status(200).json({ ok: true, recommendations });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ ok: false, message: "Internal server error" });
  }
});

app.post("/book", async (req, res) => {
  try {
    const { isbn, title, author, price } = req.body;
    if (!isStr(isbn) || !isStr(title) || !isStr(author) || !isNum(price)) {
      return invalid(res);
    }

    const service = new RegisterBookService(bookRepository, transactionManager);
    const command: RegisterBookCommand = { isbn, title, author, price };
    const book = await service.execute(command);
    res
      .status(201)
      .json({ ok: true, message: "Book registered successfully", book });
  } catch (error) {
    console.error("Error registering book:", error);
    res.status(500).json({ ok: false, message: "Internal server error" });
  }
});

app.post("/book/:isbn/review", async (req, res) => {
  try {
    const { isbn } = req.params;
    const { name, rating, comment } = req.body;
    if (!isStr(isbn) || !isStr(name) || !isNum(rating) || !isStr(comment)) {
      return invalid(res);
    }

    const service = new AddReviewService(
      reviewRepository,
      bookRepository,
      transactionManager,
    );
    const command: AddReviewCommand = { bookId: isbn, name, rating, comment };
    const review = await service.execute(command);
    res
      .status(201)
      .json({ ok: true, message: "Review added successfully", review });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ ok: false, message: "Internal server error" });
  }
});

app.put("/review/:reviewId", async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { name, rating, comment } = req.body;
    if (!isStr(reviewId) || !isStr(name) || !isNum(rating) || !isStr(comment)) {
      return invalid(res);
    }

    const service = new EditReviewService(reviewRepository, transactionManager);
    const command: EditReviewCommand = { reviewId, name, rating, comment };
    const review = await service.execute(command);
    res
      .status(200)
      .json({ ok: true, message: "Review updated successfully", review });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ ok: false, message: "Internal server error" });
  }
});

app.delete("/review/:reviewId", async (req, res) => {
  try {
    const { reviewId } = req.params;
    if (!isStr(reviewId)) return invalid(res);

    const service = new DeleteReviewService(
      reviewRepository,
      transactionManager,
    );
    const command: DeleteReviewCommand = { reviewId };
    await service.execute(command);
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ ok: false, message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
