import express from "express";
import {
  createKontrol,
  getAllKontrol,
  setKontrolIsDone,
  editKontrol,
  deleteKontrol,
} from "../controllers/controlController.js";
import { verifySupabaseUser } from "../middleware/verifySupabaseJWT.js";

const router = express.Router();

router.use(verifySupabaseUser); // Middleware Supabase

router.post("/create-kontrol", createKontrol);
router.get("/get-all-kontrol", getAllKontrol);
router.patch("/done", setKontrolIsDone);
router.put("/edit/:id", editKontrol);
router.delete("/delete/:id", deleteKontrol);

export default router;
