import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";
import { createSendToken } from "../middleware/tokenUtils.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// ── GET /api/users/profile  (protected) ───────────────────────────────────
export const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ status: "success", data: { user: req.user } });
});

// ── PATCH /api/users/profile  (protected) ─────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
  if (req.body.password || req.body.passwordConfirm) {
    return res.status(400).json({
      status:  "fail",
      message: "This route is not for password updates. Use /change-password.",
    });
  }

  const { name, bio } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { name, bio },
    { new: true, runValidators: true }
  );

  res.status(200).json({ status: "success", data: { user: updatedUser } });
});

// ── POST /api/users/upload-avatar  (protected) ────────────────────────────
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status:  "fail",
      message: "Please upload an image file.",
    });
  }

  if (req.user.avatar?.publicId) {
    await cloudinary.uploader.destroy(req.user.avatar.publicId);
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: { url: req.file.path, publicId: req.file.filename } },
    { new: true }
  );

  res.status(200).json({ status: "success", data: { user: updatedUser } });
});

// ── PATCH /api/users/change-password  (protected) ─────────────────────────
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      status:  "fail",
      message: "Please provide both current and new password.",
    });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({
      status:  "fail",
      message: "New password must be at least 8 characters.",
    });
  }

  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.correctPassword(currentPassword, user.password))) {
    return res.status(401).json({
      status:  "fail",
      message: "Your current password is incorrect.",
    });
  }

  user.password = newPassword;
  await user.save();

  createSendToken(user, 200, res);
});

// ── DELETE /api/users/me  (protected) ─────────────────────────────────────
export const deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.cookie("jwt", "loggedout", {
    expires:  new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    sameSite: "strict",
    secure:   process.env.NODE_ENV === "production",
  });

  res.status(204).json({ status: "success", data: null });
});