import express from "express";
import {
  getDoseLogStatusToday,
  // takeDoseByIot,
} from "../controllers/doseLogController.js";
import { verifySupabaseUser } from "../middleware/verifySupabaseJWT.js";
const router = express.Router();

router.get("/status-today", verifySupabaseUser, getDoseLogStatusToday); // Untuk Dashboard/IoT
// router.post("/take-dose", takeDoseByIot); // Untuk IoT

export default router;
