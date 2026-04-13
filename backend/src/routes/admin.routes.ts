import { Router } from "express";
import {
  login,
  getMe,
  updateProfile,
  updatePassword,
  getDashboardStats,
  getUsers,
  toggleUserStatus,
  updateUserRole,
  deleteUser,
} from "../controllers/admin.controller";
import {
  adminGetProducts,
  adminGetProductById,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
} from "../controllers/product.controller";
import {
  adminGetOrders,
  adminUpdateOrderStatus,
  adminCreateOrder,
} from "../controllers/order.controller";
import {
  authenticateAdmin,
  authorizeRoles,
} from "../middleware/auth.middleware";
import { productValidator } from "../validators/product.validator";
import { validateRequest } from "../middleware/validate.middleware";

export const adminRouter = Router();

// Dashboard & Auth
adminRouter.post("/login", login);

adminRouter.use(authenticateAdmin);

adminRouter.get("/me", getMe);
adminRouter.put("/me", updateProfile);
adminRouter.put("/me/password", updatePassword);
adminRouter.get("/dashboard", getDashboardStats);

// User management (ADMIN only)
adminRouter.get("/users", getUsers);
adminRouter.put("/users/:id/status", authorizeRoles("ADMIN"), toggleUserStatus);
adminRouter.put("/users/:id/role", authorizeRoles("ADMIN"), updateUserRole);
adminRouter.delete("/users/:id", authorizeRoles("ADMIN"), deleteUser);

// Product management
adminRouter.get("/products", adminGetProducts);
adminRouter.get("/products/:id", adminGetProductById);
adminRouter.post("/products", productValidator, validateRequest, adminCreateProduct);
adminRouter.put("/products/:id", productValidator, validateRequest, adminUpdateProduct);
adminRouter.delete("/products/:id", adminDeleteProduct);

// Order management
adminRouter.get("/orders", adminGetOrders);
adminRouter.post("/orders", adminCreateOrder);
adminRouter.put("/orders/:id/status", adminUpdateOrderStatus);
