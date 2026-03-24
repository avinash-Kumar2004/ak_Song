import express from "express";
import {
  signup,
  login,
  logout,
  getMe,
  getFavoriteSongs,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/favorite-songs", getFavoriteSongs); // public — for dropdown
router.post("/signup",        signup);
router.post("/login",         login);
router.post("/logout",        logout);
router.get("/me",             protect, getMe);   // protected

export default router;