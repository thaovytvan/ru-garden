import { Router } from "express";
import { 
  getDiscounts, 
  getDiscountById, 
  createDiscount, 
  updateDiscount, 
  deleteDiscount,
  validateDiscount,
  getAvailableDiscounts
} from "../controllers/discount.controller";
import { authenticateAdmin } from "../middleware/auth.middleware";

export const discountRouter = Router();

// Public routes
discountRouter.post("/validate", validateDiscount);
discountRouter.get("/available", getAvailableDiscounts);

// Admin protected routes
discountRouter.use(authenticateAdmin);
discountRouter.get("/", getDiscounts);
discountRouter.get("/:id", getDiscountById);
discountRouter.post("/", createDiscount);
discountRouter.put("/:id", updateDiscount);
discountRouter.delete("/:id", deleteDiscount);
