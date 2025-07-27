import express from "express";
import {
  getAllHistory,
  insertHistory,
} from "../controllers/historyController.js";
import { verifySupabaseUser } from "../middleware/verifySupabaseJWT.js";

const router = express.Router();
router.post("/input-history", verifySupabaseUser, insertHistory);
router.get("/get-all-history", verifySupabaseUser, getAllHistory);

export default router;
