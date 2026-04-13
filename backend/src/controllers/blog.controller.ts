import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export const getBlogs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const blogs = await prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json({ data: blogs });
  } catch (error) {
    next(error);
  }
};

export const getBlogBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params as { slug: string };
    const blog = await prisma.blogPost.findUnique({
      where: { slug }
    });
    if (!blog) {
      res.status(404).json({ error: "Không tìm thấy bài viết." });
      return;
    }
    res.json({ data: blog });
  } catch (error) {
    next(error);
  }
};

export const createBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const blog = await prisma.blogPost.create({
      data: req.body
    });
    res.status(201).json({ data: blog });
  } catch (error) {
    next(error);
  }
};
