import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { username, password } = req.body;
    
    // Check main Admin table first
    let accountInfo: any = null;
    let isFromUserTable = false;

    const admin = await prisma.admin.findUnique({ where: { username } });

    if (admin && admin.isActive) {
      const isValid = await bcrypt.compare(password, admin.password);
      if (isValid) {
        accountInfo = { id: admin.id, username: admin.username, email: admin.email, role: "ADMIN" };
      }
    }

    // Fallback to User table if username is an email
    if (!accountInfo) {
      const user = await prisma.user.findUnique({ where: { email: username } });
      if (user && user.isActive && ["STAFF", "ADMIN"].includes(user.role)) {
        const isValid = await bcrypt.compare(password, user.password);
        if (isValid) {
          accountInfo = { id: user.id, username: user.name, email: user.email, role: user.role };
          isFromUserTable = true;
        }
      }
    }

    if (!accountInfo) {
      res.status(401).json({ error: "Tài khoản không tồn tại hoặc sai mật khẩu/thiếu quyền." });
      return;
    }

    const token = jwt.sign(
      { id: accountInfo.id, username: accountInfo.username, role: accountInfo.role, email: accountInfo.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      admin: { id: accountInfo.id, username: accountInfo.username, email: accountInfo.email, role: accountInfo.role },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    
    // Identify if they are from User table or Admin table via their role/id
    // But wait, the standard Admin has role "ADMIN". A User also has role "ADMIN".
    // Let's try finding in Admin first, then User
    
    let adminProfile = await prisma.admin.findUnique({
      where: { id: authReq.user?.id },
      select: { id: true, username: true, email: true, fullName: true, createdAt: true },
    }) as any;

    if (!adminProfile) {
      const userProfile = await prisma.user.findUnique({
        where: { id: authReq.user?.id },
        select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
      });
      if (userProfile) {
        adminProfile = {
          id: userProfile.id,
          username: userProfile.name,
          email: userProfile.email,
          fullName: userProfile.name,
          role: userProfile.role,
          createdAt: userProfile.createdAt
        };
      }
    } else {
      adminProfile.role = "ADMIN";
    }

    res.json(adminProfile);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { email, fullName } = req.body;
    
    const admin = await prisma.admin.findUnique({ where: { id: authReq.user?.id } });
    if (admin) {
      const updated = await prisma.admin.update({
        where: { id: admin.id },
        data: { email, fullName },
        select: { id: true, username: true, email: true, fullName: true, createdAt: true },
      });
      res.json({ success: true, data: updated });
    } else {
      const updated = await prisma.user.update({
        where: { id: authReq.user?.id },
        data: { email, name: fullName },
        select: { id: true, name: true, email: true, role: true },
      });
      res.json({ success: true, data: updated });
    }
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { currentPassword, newPassword } = req.body;
    
    const admin = await prisma.admin.findUnique({ where: { id: authReq.user?.id } });
    
    if (admin) {
      const isValid = await bcrypt.compare(currentPassword, admin.password);
      if (!isValid) return void res.status(400).json({ success: false, message: "Mật khẩu hiện tại không đúng." });
      
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await prisma.admin.update({
        where: { id: admin.id },
        data: { password: hashedPassword },
      });
    } else {
      const user = await prisma.user.findUnique({ where: { id: authReq.user?.id } });
      if (!user) return void res.status(404).json({ success: false, message: "User not found" });

      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) return void res.status(400).json({ success: false, message: "Mật khẩu hiện tại không đúng." });

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
    }

    res.json({ success: true, message: "Cập nhật mật khẩu thành công!" });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (authReq.user?.role === "STAFF") {
      res.status(403).json({ success: false, error: "Nhân viên không có quyền xem Dashboard." });
      return;
    }

    const { days = "14" } = req.query;
    const daysInt = parseInt(days as string) || 14;

    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - daysInt);
    
    // For 1 day filter, start from beginning of today
    if (daysInt === 1) {
      startDate.setHours(0, 0, 0, 0);
    }

    // Execute simpler counts in Promise.all
    const [totalProducts, totalOrders, pendingOrders, totalUsers] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.user.count(),
    ]);

    // Extract complex query to preserve types
    const recentOrderItems = await prisma.orderItem.findMany({
      where: { 
        order: {
          createdAt: { gte: startDate },
          status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] }
        }
      },
      include: {
        order: { select: { createdAt: true } },
        product: { 
          include: { 
            category: { select: { name: true } } 
          } 
        }
      }
    }) as any[];

    // Grouping
    const chartDataMap: Record<string, number> = {};
    const categoryRevenueMap: Record<string, number> = {};
    let totalRevenue = 0;
    let totalCost = 0;

    // Initialize 1d by hour, >=1d by day
    if (daysInt === 1) {
      for(let i = 0; i <= 23; i++) {
        chartDataMap[`${i.toString().padStart(2, '0')}:00`] = 0;
      }
    } else {
      for(let i = daysInt - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
        chartDataMap[dateStr] = 0;
      }
    }

    recentOrderItems.forEach(item => {
      // Line chart grouping
      const d = new Date(item.order.createdAt);
      let key = "";
      if (daysInt === 1) {
        key = `${d.getHours().toString().padStart(2, '0')}:00`;
      } else {
        key = `${d.getDate()}/${d.getMonth() + 1}`;
      }

      const itemRev = item.price * item.quantity;
      const itemCostFn = () => {
        // use item.product.costPrice. Treat missing as 0 to be safe
        const c = item.product?.costPrice || 0;
        return c * item.quantity;
      };
      
      const itemCost = itemCostFn();

      if (chartDataMap[key] !== undefined) {
        chartDataMap[key] += itemRev;
      }

      totalRevenue += itemRev;
      totalCost += itemCost;

      // Pie chart grouping by category
      const catName = item.product?.category?.name || "KHÁC";
      if (!categoryRevenueMap[catName]) categoryRevenueMap[catName] = 0;
      categoryRevenueMap[catName] += itemRev;
    });

    const chartData = Object.keys(chartDataMap).map(key => ({
      date: key,
      revenue: chartDataMap[key]
    }));

    const pieChartData = Object.keys(categoryRevenueMap).map(cat => ({
      name: cat,
      value: categoryRevenueMap[cat]
    }));

    res.json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        pendingOrders,
        totalUsers,
        revenue: totalRevenue,
        profit: totalRevenue - totalCost,
        chartData,
        pieChartData
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (authReq.user?.role === "STAFF") {
      res.status(403).json({ success: false, error: "Nhân viên không có quyền quản lý người dùng." });
      return;
    }
    const search = req.query.search ? String(req.query.search) : undefined;
    const role = req.query.role ? String(req.query.role) : undefined;
    const page = req.query.page ? String(req.query.page) : "1";
    const limit = req.query.limit ? String(req.query.limit) : "20";
    
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role && role !== "ALL") {
      where.role = role;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          role: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: { orders: true }
          }
        },
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({ success: true, data: users, total, page: pageNum, limit: limitNum });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (authReq.user?.role === "STAFF") {
      res.status(403).json({ success: false, error: "Nhân viên không có quyền khóa/mở người dùng." });
      return;
    }
    const id = String(req.params.id);
    const { isActive } = req.body;
    
    const user = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, email: true, name: true, role: true, isActive: true }
    });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (authReq.user?.role === "STAFF") {
      res.status(403).json({ success: false, error: "Nhân viên không có quyền phân quyền." });
      return;
    }
    const id = String(req.params.id);
    const { role } = req.body;

    if (!["USER", "STAFF", "ADMIN"].includes(role)) {
      res.status(400).json({ error: "Role không hợp lệ." });
      return;
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true, isActive: true }
    });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (authReq.user?.role === "STAFF") {
      res.status(403).json({ success: false, error: "Nhân viên không có quyền xóa người dùng." });
      return;
    }
    const id = String(req.params.id);

    // Check if user has orders
    const orderCount = await prisma.order.count({ where: { userId: id } });
    if (orderCount > 0) {
      // Soft delete - just deactivate
      await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });
      res.json({ success: true, message: "User đã bị khóa vì có đơn hàng liên quan." });
      return;
    }

    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: "Đã xóa user thành công." });
  } catch (error) {
    next(error);
  }
};
