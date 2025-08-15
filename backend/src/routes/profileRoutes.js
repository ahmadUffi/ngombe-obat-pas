import express from "express";
import {
  updateProfile,
  getMyProfile,
} from "../controllers/profileController.js";
import { upload } from "../middleware/upload.js";
import { verifySupabaseUser } from "../middleware/verifySupabaseJWT.js";

const router = express.Router();

// PUT /v1/api/profile/update - Update user profile (username and phone)
// Accept optional image file field named 'image' with 5MB limit
router.put(
  "/update",
  verifySupabaseUser,
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (!err) return next();
      // Multer error handling: file too large or invalid type
      if (err.message?.includes("File too large")) {
        return res.status(400).json({
          success: false,
          message: "Ukuran gambar maksimal 5MB",
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || "Upload gambar gagal",
      });
    });
  },
  updateProfile
);

// GET /v1/api/profile/me - Get authenticated user's profile
router.get("/me", verifySupabaseUser, getMyProfile);

export default router;
