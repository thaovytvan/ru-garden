import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export const getReviewsByProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params as { productId: string };
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json({ data: reviews });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { rating, comment, productId, userId } = req.body;
    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        comment,
        productId,
        userId
      },
      include: {
        user: {
          select: { name: true }
        }
      }
    });
    res.status(201).json({ data: review });
  } catch (error) {
    next(error);
  }
};
