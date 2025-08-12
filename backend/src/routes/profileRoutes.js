import express from "express";
import { updateProfile } from "../controllers/profileController.js";
import { verifySupabaseUser } from "../middleware/verifySupabaseJWT.js";

const router = express.Router();

// PUT /v1/api/profile/update - Update user profile (username and phone)
router.put("/update", verifySupabaseUser, updateProfile);

export default router;
