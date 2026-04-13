import { Router } from "express";
import { getCategories, createCategory } from "../controllers/category.controller";

export const categoryRouter = Router();

categoryRouter.get("/", getCategories);
categoryRouter.post("/", createCategory);
