import express from "express";
import { LoginWithPaddword } from "../controllers/singinController.js";

const router = express.Router();

router.post("/", LoginWithPaddword);

export default router;
