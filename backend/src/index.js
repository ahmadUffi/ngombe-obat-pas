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
// import scheduleRoutes from "./routes/scheduleRoutes.js"; // Commented out temporarily

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/v1/api/jadwal", jadwalRoutes);
app.use("/v1/api/login", siginRoutes);
app.use("/v1/api/history", historyRoutes);
app.use("/v1/api/kontrol", controlRoutes);
app.use("/v1/api/peringatan", peringatanRoutes);
app.use("/v1/api/notes", notesRoutes);
app.use("/v1/api/message", messageRoutes);
app.use("/v1/api/forgot-password", forgotPasswordRoutes);
// app.use("/v1/api/schedule", scheduleRoutes); // Commented out temporarily

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
