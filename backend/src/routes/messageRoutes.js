import express from "express";
import {
  sendMessage,
  sendBulkMessage,
  getStatus,
} from "../controllers/messageController.js";
import { verifySupabaseUser } from "../middleware/verifySupabaseJWT.js";

const router = express.Router();

// Send single message (with auth)
router.post("/send", verifySupabaseUser, sendMessage);

// Send bulk messages (with auth)
router.post("/send-bulk", verifySupabaseUser, sendBulkMessage);

// Get message status (with auth)
router.get("/status/:messageId", verifySupabaseUser, getStatus);

// Test endpoints without auth (for development only)
router.post("/test/send", sendMessage);
router.post("/test/send-bulk", sendBulkMessage);
router.get("/test/status/:messageId", getStatus);

export default router;
