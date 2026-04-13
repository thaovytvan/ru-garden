import { Router } from "express";
import { getReviewsByProduct, createReview } from "../controllers/review.controller";

export const reviewRouter = Router();

reviewRouter.get("/product/:productId", getReviewsByProduct);
reviewRouter.post("/", createReview);
