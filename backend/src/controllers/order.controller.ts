import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";

const generateTransferContent = (orderId: string): string => {
  return `RUGARDEN ${orderId.slice(-8).toUpperCase()}`;
};

export const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { customerName, phone, email, address, note, discountCode, items } = req.body;
    const userId = req.user?.id;

    if (!items || items.length === 0) {
      res.status(400).json({ error: "Giỏ hàng trống." });
      return;
    }

    // Fetch products to get current prices and check stock
    const productIds = items.map((item: { productId: string }) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (products.length !== productIds.length) {
      res.status(400).json({ error: "Một số sản phẩm không còn tồn tại." });
      return;
    }

    for (const item of items) {
      const product = products.find((p: any) => p.id === item.productId)!;
      if (product.stock < item.quantity) {
        res.status(400).json({
          error: `Sản phẩm ${product.name} không đủ số lượng trong kho (Còn lại: ${product.stock}).`,
        });
        return;
      }
    }

    const calculatedTotal = items.reduce(
      (sum: number, item: { productId: string; quantity: number }) => {
        const product = products.find((p: any) => p.id === item.productId)!;
        const price = product.salePrice ?? product.price;
        return sum + price * item.quantity;
      },
      0
    );

    let discountId = null;
    let discountAmount = 0;
    let appliedDiscountCode = discountCode;

    if (discountCode) {
      const discount = await prisma.discount.findUnique({
        where: { code: discountCode.toUpperCase() },
      });

      if (!discount || !discount.isActive) {
        res.status(400).json({ error: "Mã giảm giá không hợp lệ." });
        return;
      }

      const now = new Date();
      if (discount.startDate > now || (discount.endDate && discount.endDate < now)) {
        res.status(400).json({ error: "Mã giảm giá đã hết hạn hoặc chưa được áp dụng." });
        return;
      }

      if (discount.usageLimit !== null && discount.usedCount >= discount.usageLimit) {
        res.status(400).json({ error: "Mã giảm giá đã hết lượt sử dụng." });
        return;
      }

      if (discount.minOrderAmount && calculatedTotal < discount.minOrderAmount) {
        res.status(400).json({ error: `Đơn hàng tối thiểu ${discount.minOrderAmount}đ để dùng mã này.` });
        return;
      }

      discountId = discount.id;
      appliedDiscountCode = discount.code;
      if (discount.type === "PERCENTAGE") {
        discountAmount = (calculatedTotal * discount.value) / 100;
        if (discount.maxDiscountAmount && discountAmount > discount.maxDiscountAmount) {
          discountAmount = discount.maxDiscountAmount;
        }
      } else {
        discountAmount = discount.value;
      }
    }

    const finalTotal = Math.max(0, calculatedTotal - discountAmount);

    // Create order and update counts in a transaction
    const order = await prisma.$transaction(async (tx: any) => {
      // 1. Create the order
      const newOrder = await tx.order.create({
        data: {
          customerName,
          phone,
          email,
          address,
          note,
          discountCode: appliedDiscountCode,
          discountAmount,
          discountId,
          totalAmount: finalTotal,
          userId,
          transferContent: "",
          items: {
            create: items.map((item: { productId: string; quantity: number }) => {
              const product = products.find((p: any) => p.id === item.productId)!;
              return {
                productId: item.productId,
                quantity: item.quantity,
                price: product.salePrice ?? product.price,
              };
            }),
          },
        },
      });

      // 2. Decrement stock for each product
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 3. Increment discount usedCount
      if (discountId) {
        await tx.discount.update({
          where: { id: discountId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return newOrder;
    });

    // Update transfer content with order ID
    const transferContent = generateTransferContent(order.id);
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { transferContent },
      include: { items: { include: { product: true } } },
    });

    res.status(201).json({
      order: updatedOrder,
      bankInfo: {
        bankName: process.env.BANK_NAME || "Vietcombank",
        accountNumber: process.env.BANK_ACCOUNT_NUMBER || "1234567890",
        accountHolder: process.env.BANK_ACCOUNT_HOLDER || "NGUYEN VAN A",
        branch: process.env.BANK_BRANCH || "Chi nhánh HCM",
        transferContent,
        amount: finalTotal,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order) {
      res.status(404).json({ error: "Không tìm thấy đơn hàng." });
      return;
    }
    res.json(order);
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: "Yêu cầu đăng nhập." });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ data: orders });
  } catch (error) {
    next(error);
  }
};

// Admin controllers
export const adminCreateOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { customerName, phone, email, address, note, discountCode, discountAmount, items } = req.body;

    if (!items || items.length === 0) {
      res.status(400).json({ error: "Giỏ hàng trống." });
      return;
    }

    // Fetch products to get current prices and check stock
    const productIds = items.map((item: { productId: string }) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (products.length !== productIds.length) {
      res.status(400).json({ error: "Một số sản phẩm không còn tồn tại." });
      return;
    }

    for (const item of items) {
      const product = products.find((p: any) => p.id === item.productId)!;
      if (product.stock < item.quantity) {
        res.status(400).json({
          error: `Sản phẩm ${product.name} không đủ số lượng trong kho (Còn lại: ${product.stock}).`,
        });
        return;
      }
    }

    const calculatedTotal = items.reduce(
      (sum: number, item: { productId: string; quantity: number }) => {
        const product = products.find((p: any) => p.id === item.productId)!;
        const price = product.salePrice ?? product.price;
        return sum + price * item.quantity;
      },
      0
    );

    const finalTotal = Math.max(0, calculatedTotal - (Number(discountAmount) || 0));

    const finalCustomerName = customerName && customerName.trim() !== "" ? customerName : "Khách mua lẻ";
    const finalPhone = phone && phone.trim() !== "" ? phone : "0000000000";
    const finalAddress = address && address.trim() !== "" ? address : "Tại cửa hàng";

    let discountId = null;
    if (discountCode) {
      const discount = await prisma.discount.findUnique({
        where: { code: discountCode.toUpperCase() },
      });
      if (discount) {
        discountId = discount.id;
      }
    }

    // Create order and decrement stock in a transaction
    const order = await prisma.$transaction(async (tx: any) => {
      // 1. Create the order
      const newOrder = await tx.order.create({
        data: {
          customerName: finalCustomerName,
          phone: finalPhone,
          email: email || "khachle@rugarden.com",
          address: finalAddress,
          note: note || "",
          discountCode: discountCode || "",
          discountAmount: Number(discountAmount) || 0,
          discountId,
          totalAmount: finalTotal,
          status: "DELIVERED",
          transferContent: "",
          items: {
            create: items.map((item: { productId: string; quantity: number }) => {
              const product = products.find((p: any) => p.id === item.productId)!;
              return {
                productId: item.productId,
                quantity: item.quantity,
                price: product.salePrice ?? product.price,
              };
            }),
          },
        },
      });

      // 2. Decrement stock for each product
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 3. Increment discount usedCount if it was a real code
      if (discountId) {
        await tx.discount.update({
          where: { id: discountId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return newOrder;
    });

    const transferContent = "MUA TẠI CỬA HÀNG";
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { transferContent },
      include: { items: { include: { product: true } } },
    });

    res.status(201).json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

export const adminGetOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, page = "1", limit = "20", sortBy = "createdAt", sortOrder = "desc" } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where = status ? { status: status as any } : {};
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        include: { items: { include: { product: true } } },
        orderBy: { [sortBy as string]: sortOrder as any },
      }),
      prisma.order.count({ where }),
    ]);
    res.json({ data: orders, total });
  } catch (error) {
    next(error);
  }
};

export const adminUpdateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: { include: { product: true } } },
    });
    res.json(order);
  } catch (error) {
    next(error);
  }
};
