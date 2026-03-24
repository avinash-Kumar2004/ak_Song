import jwt from "jsonwebtoken";

// ── Sign JWT ──────────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ── Create token + send response ──────────────────────────────────────────
export const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // httpOnly cookie (optional — frontend also stores in localStorage)
  const cookieOptions = {
    expires:  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    sameSite: "strict",
    secure:   process.env.NODE_ENV === "production",
  };

  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,              // ← frontend reads this from response body
    data: { user },
  });
};