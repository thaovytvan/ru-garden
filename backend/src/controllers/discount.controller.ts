import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export const getDiscounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const discounts = await prisma.discount.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ data: discounts });
  } catch (error) {
    next(error);
  }
};

export const getAvailableDiscounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const discounts = await prisma.discount.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    // Client-side filtration for usageLimit (Prisma doesn't easily compare two columns like usedCount < usageLimit in where)
    // Actually we can use Prisma.field for that but simpler to just filter here if list is small, 
    // or use a raw query/ Prisma extensions. Let's filter here for safety.
    const available = discounts.filter((d: any) => d.usageLimit === null || d.usedCount < d.usageLimit);

    res.json({ data: available });
  } catch (error) {
    next(error);
  }
};

export const getDiscountById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const discount = await prisma.discount.findUnique({
      where: { id },
    });
    if (!discount) {
      res.status(404).json({ error: "Không tìm thấy mã giảm giá." });
      return;
    }
    res.json(discount);
  } catch (error) {
    next(error);
  }
};

export const createDiscount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      code, type, value, minOrderAmount, maxDiscountAmount, 
      startDate, endDate, usageLimit, isActive 
    } = req.body;

    const existing = await prisma.discount.findUnique({ where: { code } });
    if (existing) {
      res.status(400).json({ error: "Mã giảm giá này đã tồn tại." });
      return;
    }

    const discount = await prisma.discount.create({
      data: {
        code: code.toUpperCase(),
        type,
        value: Number(value),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        usageLimit: usageLimit ? Number(usageLimit) : null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });
    res.status(201).json(discount);
  } catch (error) {
    next(error);
  }
};

export const updateDiscount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { 
      code, type, value, minOrderAmount, maxDiscountAmount, 
      startDate, endDate, usageLimit, isActive 
    } = req.body;

    const discount = await prisma.discount.update({
      where: { id },
      data: {
        code: code?.toUpperCase(),
        type,
        value: value !== undefined ? Number(value) : undefined,
        minOrderAmount: minOrderAmount !== undefined ? Number(minOrderAmount) : undefined,
        maxDiscountAmount: maxDiscountAmount !== undefined ? Number(maxDiscountAmount) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        usageLimit: usageLimit !== undefined ? Number(usageLimit) : undefined,
        isActive,
      },
    });
    res.json(discount);
  } catch (error) {
    next(error);
  }
};

export const deleteDiscount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.discount.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const validateDiscount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code, amount } = req.body;
    if (!code) {
      res.status(400).json({ error: "Thiếu mã giảm giá." });
      return;
    }

    const discount = await prisma.discount.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!discount || !discount.isActive) {
      res.status(400).json({ error: "Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa." });
      return;
    }

    const now = new Date();
    if (discount.startDate > now) {
      res.status(400).json({ error: "Chương trình chưa bắt đầu." });
      return;
    }
    if (discount.endDate && discount.endDate < now) {
      res.status(400).json({ error: "Mã giảm giá đã hết hạn." });
      return;
    }

    if (discount.usageLimit !== null && discount.usedCount >= discount.usageLimit) {
      res.status(400).json({ error: "Mã giảm giá đã hết lượt sử dụng." });
      return;
    }

    if (amount !== undefined && discount.minOrderAmount && amount < discount.minOrderAmount) {
      res.status(400).json({ 
        error: `Đơn hàng tối thiểu ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(discount.minOrderAmount)} để áp dụng mã này.` 
      });
      return;
    }

    // Calculate discount value
    let reduction = 0;
    if (discount.type === "PERCENTAGE") {
      reduction = (amount * discount.value) / 100;
      if (discount.maxDiscountAmount && reduction > discount.maxDiscountAmount) {
        reduction = discount.maxDiscountAmount;
      }
    } else {
      reduction = discount.value;
    }

    res.json({
      valid: true,
      discountId: discount.id,
      code: discount.code,
      type: discount.type,
      value: discount.value,
      reduction: Math.min(reduction, amount || reduction),
    });
  } catch (error) {
    next(error);
  }
};
