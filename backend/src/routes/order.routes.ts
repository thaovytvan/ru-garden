import { Router } from "express";
import { createOrder, getOrderById, getUserOrders } from "../controllers/order.controller";
import { body } from "express-validator";
import { validateRequest } from "../middleware/validate.middleware";
import { authenticateUser, optionalAuthenticateUser } from "../middleware/auth.middleware";

export const orderRouter = Router();

const validateOrder = [
  body("customerName").notEmpty().withMessage("Tên không được để trống"),
  body("phone").notEmpty().withMessage("Số điện thoại không được để trống"),
  body("address").notEmpty().withMessage("Địa chỉ không được để trống"),
  body("items").isArray({ min: 1 }).withMessage("Giỏ hàng không hợp lệ"),
];

// Public routes (with optional auth to capture userId)
orderRouter.post("/", optionalAuthenticateUser, validateOrder, validateRequest, createOrder);

// User routes
orderRouter.get("/me", authenticateUser, getUserOrders);
orderRouter.get("/:id", getOrderById);
