import { Router } from "express";
import { getBlogs, getBlogBySlug, createBlog } from "../controllers/blog.controller";

export const blogRouter = Router();

blogRouter.get("/", getBlogs);
blogRouter.get("/:slug", getBlogBySlug);
blogRouter.post("/", createBlog);
