import express from "express";
import { forgotPassword } from "../controllers/forgotPasswordController.js";

const router = express.Router();

// POST /v1/api/forgot-password - Send password reset email
router.post("/", forgotPassword);

export default router;
