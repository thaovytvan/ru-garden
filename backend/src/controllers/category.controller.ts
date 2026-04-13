import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    res.json({ data: categories });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, value } = req.body;
    const category = await prisma.category.create({
      data: { name, value },
    });
    res.status(201).json({ data: category });
  } catch (error) {
    next(error);
  }
};
