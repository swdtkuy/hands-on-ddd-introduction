import express, { json, Response } from "express";
import path from "path";

import "reflect-metadata";
import { container } from "tsyringe";

import {
  RegisterBookCommand,
  RegisterBookService,
} from "Application/Book/RegisterBookService/RegisterBookService";
import { CatalogServiceEventHandler } from "Application/DomainEventHandlers/CatalogServiceEventHandler";
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

import pool from "Infrastructure/SQL/db";
import "../../Program";

const app = express();
const port = 3000;

app.use(json());
app.use(express.static(path.join(__dirname, "public")));

const isStr = (v: unknown): v is string =>
  typeof v === "string" && v.length > 0;
const isNum = (v: unknown): v is number => typeof v === "number" && !isNaN(v);
const invalid = (res: Response) =>
  res.status(400).json({ ok: false, message: "Invalid request" });

app.get("/db/state", async (_req, res) => {
  try {
    const booksResult = await pool.query(
      'SELECT * FROM "Book" ORDER BY "bookId"',
    );
    const reviewsResult = await pool.query(
      'SELECT * FROM "Review" ORDER BY "bookId", "reviewId"',
    );
    res.json({
      ok: true,
      books: booksResult.rows,
      reviews: reviewsResult.rows,
    });
  } catch {
    res.status(503).json({
      ok: false,
      message: "DBに接続できません。docker compose up -d で起動してください。",
    });
  }
});

app.get("/book/:isbn/recommendations", async (req, res) => {
  try {
    const { isbn } = req.params;
    const { maxCount } = req.query;
    if (!isStr(isbn) || (maxCount !== undefined && !isNum(Number(maxCount))))
      return invalid(res);

    const getRecommendedBooksService = container.resolve(
      GetRecommendedBooksService,
    );
    const command: GetRecommendedBooksCommand = {
      bookId: isbn,
      maxCount: maxCount !== undefined ? Number(maxCount) : undefined,
    };

    const recommendedBooks = await getRecommendedBooksService.execute(command);
    res.status(200).json({ ok: true, recommendations: recommendedBooks });
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

    const registerBookService = container.resolve(RegisterBookService);
    const command: RegisterBookCommand = { isbn, title, author, price };
    const book = await registerBookService.execute(command);
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

    const addReviewService = container.resolve(AddReviewService);
    const command: AddReviewCommand = { bookId: isbn, name, rating, comment };
    const review = await addReviewService.execute(command);
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

    const editReviewService = container.resolve(EditReviewService);
    const command: EditReviewCommand = { reviewId, name, rating, comment };
    const review = await editReviewService.execute(command);
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

    const deleteReviewService = container.resolve(DeleteReviewService);
    const command: DeleteReviewCommand = { reviewId };
    await deleteReviewService.execute(command);
    res.status(204).end();
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ ok: false, message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);

  container.resolve(CatalogServiceEventHandler).register();
});
