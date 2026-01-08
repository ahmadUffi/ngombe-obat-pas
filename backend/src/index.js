import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import compression from "compression";
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
import path from "path";
import { fileURLToPath } from "url";
import { swaggerDocument } from "./config/swagger.js";

// Load .env and override any existing env vars from the shell, so .env wins
dotenv.config({ override: true });

const app = express();
app.use(cors());
// Enable gzip/deflate/br compression for API responses
app.use(compression());
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

// Swagger Documentation Routes
app.get("/api-docs.json", (req, res) => {
  res.json(swaggerDocument);
});

// Swagger UI HTML
app.get("/api-docs", (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SmedBox API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui.css">
  <style>
    body {
      margin: 0;
      padding: 0;
    }
    .topbar {
      display: none;
    }
    .swagger-ui .info .title {
      font-size: 36px;
    }
    .swagger-ui .info {
      margin: 50px 0;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        url: '/api-docs.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        persistAuthorization: true,
        tryItOutEnabled: true,
        filter: true,
        syntaxHighlight: {
          activate: true,
          theme: "monokai"
        }
      });
    };
  </script>
</body>
</html>
  `;
  res.send(html);
});

const PORT = process.env.PORT || 5000;

// Optionally serve the built frontend (SPA) with cache headers
const SERVE_FRONTEND =
  (process.env.SERVE_FRONTEND || "false").toLowerCase() === "true";
if (SERVE_FRONTEND) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const distDir =
    process.env.FRONTEND_DIST || path.resolve(__dirname, "../../frontend/dist");

  app.use(
    express.static(distDir, {
      setHeaders: (res, filePath) => {
        // Cache-bust hashed assets aggressively; HTML short cache
        if (
          /(\.[a-f0-9]{8,}\.)|(assets\/.+\.(js|css|png|jpg|svg|webp|woff2?))/i.test(
            filePath
          )
        ) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        } else if (filePath.endsWith("index.html")) {
          res.setHeader("Cache-Control", "no-cache");
        }
      },
    })
  );

  // SPA fallback AFTER API routes
  app.get(/^(?!\/v1\/api).*/, (req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
// Cron: stock checker (env-controlled)
const CRON_ENABLED =
  (process.env.CRON_ENABLED || "false").toLowerCase() === "true";
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || "46 15 * * *"; // default 07:00 & 19:00 WIB

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
    { timezone: "Asia/Jakarta" } // ✅ fix timezone
  );
} else {
  console.log("StockCron disabled. Set CRON_ENABLED=true in .env to enable.");
}

// Daily 00:01 WIB
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
  { timezone: "Asia/Jakarta" } // ✅ fix timezone
);

// Every 5 minutes (00, 10, 20, 30, 40, 50 WIB)
cron.schedule(
  "*/5 * * * *",
  async () => {
    try {
      const res = await markMissedForTodayAll();
      if (res?.updated) console.log("DoseLog mark missed:", res);
    } catch (e) {
      console.error("DoseLog mark missed failed:", e?.message || e);
    }
  },
  { timezone: "Asia/Jakarta" } // ✅ fix timezone
);
