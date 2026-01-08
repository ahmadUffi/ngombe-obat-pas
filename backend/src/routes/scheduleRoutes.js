import express from "express";
import { createControlScheduleReminderEndpoint } from "../controllers/scheduleController.js";
import { verifySupabaseUser } from "../middleware/verifySupabaseJWT.js";

const router = express.Router();

// Apply Supabase authentication middleware
router.use(verifySupabaseUser);

// Schedule reminder endpoints
router.post("/control-reminder", createControlScheduleReminderEndpoint);

export default router;
