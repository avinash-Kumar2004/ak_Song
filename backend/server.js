import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler } from "./middleware/authMiddleware.js";

// ── Connect to MongoDB ─────────────────────────────────────────────────────
connectDB();

const app = express();

// ── Security headers ───────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ───────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin:      process.env.CLIENT_URL,
    credentials: true, // allow cookies
  })
);

// ── Rate limiting (auth routes only) ──────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      20,              // max 20 requests per window per IP
  message:  { status: "fail", message: "Too many requests from this IP. Try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders:   false,
});

// ── Body + cookie parsing ──────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));        // prevent large payload attacks
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Logging (dev only) ─────────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// ── Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",  authLimiter, authRoutes);
app.use("/api/users", userRoutes);

// ── Health check ──────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok", env: process.env.NODE_ENV }));

// ── 404 handler ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Route ${req.originalUrl} not found.`,
  });
});
// ── Global error handler ──────────────────────────────────────────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});