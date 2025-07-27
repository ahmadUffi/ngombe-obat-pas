import express from "express";
import {
  inputJadwal,
  getAllJadwalbyIDForWeb,
  getAllJadwalbyIDForIot,
  updateStockObatByIdForIot,
  updateStockObatByIdForWeb,
  deleteJadwalById,
} from "../controllers/jadwalController.js";
import { verifySupabaseUser } from "../middleware/verifySupabaseJWT.js";

const router = express.Router();

router.post("/input", verifySupabaseUser, inputJadwal);
router.get("/get-for-web", verifySupabaseUser, getAllJadwalbyIDForWeb);
router.get("/get-for-iot", verifySupabaseUser, getAllJadwalbyIDForIot);
router.put("/update-stock-obat-iot", updateStockObatByIdForIot);
router.put("/update-stock-obat-web", updateStockObatByIdForWeb);
router.delete("/delete/:jadwal_id", verifySupabaseUser, deleteJadwalById);

export default router;
