import { Router } from "express";
import { getProducts, getProductBySlug } from "../controllers/product.controller";

export const productRouter = Router();

// Public routes
productRouter.get("/", getProducts);
productRouter.get("/:slug", getProductBySlug);
