import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { productRouter } from "./routes/product.routes";
import { orderRouter } from "./routes/order.routes";
import { adminRouter } from "./routes/admin.routes";
import { bankinfoRouter } from "./routes/bankinfo.routes";
import { uploadRouter } from "./routes/upload.routes";
import { userRouter } from "./routes/user.routes";
import { categoryRouter } from "./routes/category.routes";
import { blogRouter } from "./routes/blog.routes";
import { reviewRouter } from "./routes/review.routes";
import { contactRouter } from "./routes/contact.routes";
import { discountRouter } from "./routes/discount.routes";
import { setupChatSocket } from "./socket/chat.socket";
import { errorHandler } from "./middleware/error.middleware";
import path from "path";

// Configuration loaded at top

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  process.env.ADMIN_URL || "http://localhost:5173",
];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
  },
});

// Security & Performance Middleware
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // max 100 requests per minute per IP
  message: { error: "Quá nhiều yêu cầu, vui lòng thử lại sau 1 phút." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);
app.use("/api/admin", adminRouter);
app.use("/api/bankinfo", bankinfoRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/users", userRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/blogs", blogRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/contact", contactRouter);
app.use("/api/discounts", discountRouter);

// Serve static files for uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Chat socket
setupChatSocket(io);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🌿 Rú Garden API running on port ${PORT}`);
  console.log(`📡 Socket.io ready`);
});

export { io };
