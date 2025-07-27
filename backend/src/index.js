import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jadwalRoutes from "./routes/jadwalRoutes.js";
import signinRoutes from "./routes/signinRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import controlRoutes from "./routes/controlRoutes.js";
import peringatanRoutes from "./routes/peringatanRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

app.use("/v1/api/jadwal", jadwalRoutes);
app.use("/v1/api/login", signinRoutes);
app.use("/v1/api/history", historyRoutes);
app.use("/v1/api/kontrol", controlRoutes);
app.use("/v1/api/peringatan", peringatanRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});
