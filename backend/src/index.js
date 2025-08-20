import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jadwalRoutes from "./routes/jadwalRoutes.js";
import siginRoutes from "./routes/signinRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import controlRoutes from "./routes/controlRoutes.js";
import peringatanRoutes from "./routes/peringatanRoutes.js";
import notesRoutes from "./routes/notesRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import forgotPasswordRoutes from "./routes/forgotPasswordRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import doseLogRoutes from "./routes/doseLogRoutes.js";
// import scheduleRoutes from "./routes/scheduleRoutes.js"; // Commented out temporarily
import cron from "node-cron";
import { checkAllJadwalStockAndNotify } from "./services/stockCronService.js";
import {
  ensurePendingForTodayAllJadwal,
  markMissedForTodayAll,
} from "./services/doseLogService.js";
import adminRoutes from "./routes/adminRoutes.js";
import supabaseMiddleware from "./middleware/supabase.js";

// Load .env and override any existing env vars from the shell, so .env wins
dotenv.config({ override: true });

const app = express();
app.use(cors());
app.use(express.json());
app.use(supabaseMiddleware);

app.use("/v1/api/jadwal", jadwalRoutes);
app.use("/v1/api/login", siginRoutes);
app.use("/v1/api/history", historyRoutes);
app.use("/v1/api/kontrol", controlRoutes);
app.use("/v1/api/peringatan", peringatanRoutes);
app.use("/v1/api/notes", notesRoutes);
app.use("/v1/api/message", messageRoutes);
app.use("/v1/api/forgot-password", forgotPasswordRoutes);
app.use("/v1/api/profile", profileRoutes);
app.use("/v1/api/admin", adminRoutes);
app.use("/v1/api/dose-log", doseLogRoutes);
// app.use("/v1/api/schedule", scheduleRoutes); // Commented out temporarily

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

// Cron: stock checker (env-controlled)
const CRON_ENABLED =
  (process.env.CRON_ENABLED || "false").toLowerCase() === "true";
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || "0 7,19 * * *"; // default 07:00 & 19:00

console.log(
  "CRON config:",
  JSON.stringify({
    CRON_ENABLED: process.env.CRON_ENABLED,
    CRON_SCHEDULE: process.env.CRON_SCHEDULE,
  })
);

if (CRON_ENABLED) {
  console.log("StockCron enabled with schedule:", CRON_SCHEDULE);
  cron.schedule(
    CRON_SCHEDULE,
    async () => {
      try {
        const res = await checkAllJadwalStockAndNotify();
        console.log("StockCron result:", res);
      } catch (e) {
        console.error("StockCron failed:", e?.message || e);
      }
    },
    { timezone: "Asia/Jakarta" }
  );
} else {
  console.log("StockCron disabled. Set CRON_ENABLED=true in .env to enable.");
}

// Daily 00:01 cron: generate pending doses for today, then mark missed periodically
cron.schedule(
  "1 0 * * *",
  async () => {
    try {
      const seed = await ensurePendingForTodayAllJadwal();
      console.log("DoseLog seed today:", seed);
    } catch (e) {
      console.error("DoseLog seed failed:", e?.message || e);
    }
  },
  { timezone: "Asia/Jakarta" }
);

// Optional: minute-level cron to flip overdue pending to missed (grace 60m)
cron.schedule(
  "*/10 * * * *",
  async () => {
    try {
      const res = await markMissedForTodayAll();
      if (res?.updated) console.log("DoseLog mark missed:", res);
    } catch (e) {
      console.error("DoseLog mark missed failed:", e?.message || e);
    }
  },
  { timezone: "Asia/Jakarta" }
);
