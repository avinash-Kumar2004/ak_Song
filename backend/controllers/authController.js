import User, { FAVORITE_SONGS } from "../models/User.js";
import { createSendToken } from "../middleware/tokenUtils.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ── SIGNUP ─────────────────────────────────────────────────────────────────
export const signup = asyncHandler(async (req, res) => {   // ✅ removed `next`
  const { name, email, phone, password, favoriteGenre } = req.body;

  // ── Basic field validation ──────────────────────────────────────────────
  const missing = [];
  if (!name?.trim())     missing.push("name");
  if (!email?.trim())    missing.push("email");
  if (!password?.trim()) missing.push("password");

  if (missing.length) {
    return res.status(400).json({
      status:  "fail",
      message: `Please provide: ${missing.join(", ")}.`,
    });
  }

  // ── Favorite song validation (optional field) ───────────────────────────
  if (favoriteGenre && !FAVORITE_SONGS.includes(favoriteGenre)) {
    return res.status(400).json({
      status:  "fail",
      message: "Please select a valid favorite song from the list.",
    });
  }

  // ── Build user payload ─────────────────────────────────────────────────
  const payload = {
    name:    name.trim(),
    email:   email.toLowerCase().trim(),
    password,
    ...(favoriteGenre && { favoriteGenre }),
    ...(phone?.trim() && { phone: phone.trim() }),
  };

  const user = await User.create(payload);
  createSendToken(user, 201, res);
});

// ── LOGIN ──────────────────────────────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {    // ✅ removed `next`
  const { identifier, password } = req.body;

  if (!identifier?.trim() || !password) {
    return res.status(400).json({
      status:  "fail",
      message: "Please provide email/phone and password.",
    });
  }

  const isEmail = identifier.includes("@");
  const query   = isEmail
    ? { email: identifier.toLowerCase().trim() }
    : { phone: identifier.trim() };

  const user = await User.findOne(query).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(401).json({
      status:  "fail",
      message: "Incorrect credentials. Please try again.",
    });
  }

  createSendToken(user, 200, res);
});

// ── LOGOUT ─────────────────────────────────────────────────────────────────
export const logout = (_req, res) => {
  res.cookie("jwt", "loggedout", {
    expires:  new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    sameSite: "strict",
    secure:   process.env.NODE_ENV === "production",
  });
  res.status(200).json({ status: "success", message: "Logged out successfully." });
};

// ── GET ME ─────────────────────────────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ status: "success", data: { user: req.user } });
});

// ── FAVORITE SONGS LIST ────────────────────────────────────────────────────
export const getFavoriteSongs = (_req, res) => {
  res.status(200).json({ status: "success", data: { songs: FAVORITE_SONGS } });
};