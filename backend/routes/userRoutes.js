import express from "express";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  deleteAccount,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

// All user routes require authentication
router.use(protect);

router.get("/profile",          getProfile);
router.patch("/profile",        updateProfile);
router.post("/upload-avatar",   upload.single("avatar"), uploadAvatar);
router.patch("/change-password", changePassword);
router.delete("/me",            deleteAccount);

export default router;