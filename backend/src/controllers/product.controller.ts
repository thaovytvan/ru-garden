import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      category,
      search,
      featured,
      minPrice,
      maxPrice,
      page = "1",
      limit = "12",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: Prisma.ProductWhereInput = {
      isActive: true,
      ...(category && { category: { value: category as string } }),
      ...(featured === "true" && { isFeatured: true }),
      ...(search && {
        OR: [
          { name: { contains: search as string, mode: "insensitive" } },
          { description: { contains: search as string, mode: "insensitive" } },
          { tags: { has: search as string } },
        ],
      }),
      ...(minPrice || maxPrice
        ? {
            price: {
              ...(minPrice && { gte: parseFloat(minPrice as string) }),
              ...(maxPrice && { lte: parseFloat(maxPrice as string) }),
            },
          }
        : {}),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        include: { category: true },
        orderBy:
          sortBy === "featured"
            ? [{ isFeatured: "desc" }, { createdAt: "desc" }]
            : { [sortBy as string]: sortOrder as Prisma.SortOrder },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      data: products,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const slug = req.params.slug as string;
    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: { category: true },
    });
    if (!product) {
      res.status(404).json({ error: "Không tìm thấy sản phẩm." });
      return;
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// Admin controllers
export const adminGetProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) {
      res.status(404).json({ error: "Không tìm thấy sản phẩm." });
      return;
    }
    res.json({ data: product });
  } catch (error) {
    next(error);
  }
};

export const adminGetProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page = "1", limit = "20", sortBy = "createdAt", sortOrder = "desc" } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const orderObj: any = {};
    if (sortBy === "category") {
      orderObj.category = { name: sortOrder };
    } else {
      orderObj[sortBy as string] = sortOrder;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: parseInt(limit as string),
        include: { category: true },
        orderBy: orderObj,
      }),
      prisma.product.count(),
    ]);
    res.json({ data: products, total });
  } catch (error) {
    next(error);
  }
};

export const adminCreateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await prisma.product.create({ data: req.body });
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const adminUpdateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.update({
      where: { id },
      data: req.body,
    });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const adminDeleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    res.json({ message: "Sản phẩm đã được ẩn thành công." });
  } catch (error) {
    next(error);
  }
};
