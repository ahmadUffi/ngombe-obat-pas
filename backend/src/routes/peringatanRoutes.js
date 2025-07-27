// routes/peringatanRoutes.js
import express from "express";
import {
  insertPeringatan,
  getAllPeringatan,
} from "../controllers/peringatanController.js";
import { verifySupabaseUser } from "../middleware/verifySupabaseJWT.js";

const router = express.Router();

router.use(verifySupabaseUser);
router.post("/create-peringatan", insertPeringatan);
router.get("/get-all-peringatan", getAllPeringatan);

export default router;
