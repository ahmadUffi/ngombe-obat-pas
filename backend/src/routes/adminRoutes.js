import express from "express";
import { verifySupabaseUser } from "../middleware/verifySupabaseJWT.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { checkAllJadwalStockAndNotify } from "../services/stockCronService.js";

const router = express.Router();

// POST /v1/api/admin/cron/stock-check
router.post(
  "/cron/stock-check",
  verifySupabaseUser,
  requireAdmin,
  async (req, res) => {
    try {
      const result = await checkAllJadwalStockAndNotify();
      return res.json({ success: true, result });
    } catch (e) {
      return res.status(500).json({ success: false, message: e?.message || String(e) });
    }
  }
);

export default router;
