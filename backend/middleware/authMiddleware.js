import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ── Protect: verify JWT & attach user to req ──────────────────────────────
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    res.status(401);
    throw new Error("You are not logged in. Please log in to get access.");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    res.status(401);
    throw new Error("The user belonging to this token no longer exists.");
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    res.status(401);
    throw new Error("User recently changed password. Please log in again.");
  }

  req.user = currentUser;
  next();
};

// ── Global error handler ──────────────────────────────────────────────────
export const errorHandler = (err, _req, res, _next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      status:  "fail",
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already in use.`,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ status: "fail", message: messages.join(". ") });
  }

  if (err.name === "JsonWebTokenError")
    return res.status(401).json({ status: "fail", message: "Invalid token." });
  if (err.name === "TokenExpiredError")
    return res.status(401).json({ status: "fail", message: "Token expired. Please log in again." });

  res.status(statusCode).json({
    status:  statusCode >= 500 ? "error" : "fail",
    message: err.message || "Something went wrong",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};