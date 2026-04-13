import { Router } from "express";
import { register, login, getMe, updateProfile, updatePassword } from "../controllers/user.controller";
import { authenticateUser } from "../middleware/auth.middleware";

export const userRouter = Router();

// Public routes
userRouter.post("/register", register);
userRouter.post("/login", login);

// Protected routes
userRouter.use(authenticateUser);

userRouter.get("/me", getMe);
userRouter.put("/me", updateProfile);
userRouter.put("/me/password", updatePassword);
