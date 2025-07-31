import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jadwalRoutes from "./routes/jadwalRoutes.js";
import siginRoutes from "./routes/signinRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import controlRoutes from "./routes/controlRoutes.js";
import peringatanRoutes from "./routes/peringatanRoutes.js";
import notesRoutes from "./routes/notesRoutes.js";

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

app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});
