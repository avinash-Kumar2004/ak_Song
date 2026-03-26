// routes/uploadRoutes.js
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const router = express.Router();

// ── Cloudinary config — ENV variables se aata hai, kabhi hardcode mat karo ──
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Multer + Cloudinary storage ────────────────────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    resource_type: "video",          // Cloudinary audio ke liye "video" use karta hai
    folder:        "music-uploads",  // Cloudinary dashboard mein yeh folder banega
    format:        async () => "mp3",
    public_id: (_req, file) => {
      const name = file.originalname
        .replace(/\.[^.]+$/, "")     // extension hatao
        .replace(/\s+/g, "_");       // spaces ko underscore
      return `${Date.now()}_${name}`;
    },
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max per file
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Sirf audio files allowed hain (.mp3, .wav, .ogg etc.)"), false);
    }
  },
});

// ── POST /api/upload-song ──────────────────────────────────────────────────
// Frontend se ek audio file aati hai, Cloudinary pe upload hoti hai
router.post("/upload-song", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: "fail", message: "File nahi mili" });
  }

  return res.status(200).json({
    status:   "success",
    url:      req.file.path,      // Cloudinary secure HTTPS URL
    publicId: req.file.filename,  // delete ke waqt zaroori
  });
});

// ── DELETE /api/upload-song/:publicId ─────────────────────────────────────
// Song delete hone pe Cloudinary se bhi hata do
router.delete("/upload-song/:publicId", async (req, res) => {
  try {
    const publicId = decodeURIComponent(req.params.publicId);
    await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
    return res.status(200).json({ status: "success", deleted: publicId });
  } catch (err) {
    console.error("[DELETE /upload-song]", err.message);
    return res.status(500).json({ status: "fail", message: "Cloudinary delete failed" });
  }
});

// ── Multer error handler ───────────────────────────────────────────────────
router.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    // e.g. file too large
    return res.status(400).json({ status: "fail", message: err.message });
  }
  if (err) {
    return res.status(400).json({ status: "fail", message: err.message });
  }
});

export default router;