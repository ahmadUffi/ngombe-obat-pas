import {
  createPeringatan,
  getPeringatan,
} from "../services/peringatanService.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// Create peringatan baru
export const insertPeringatan = asyncHandler(async (req, res) => {
  const { id, pesan } = req.body;

  if (!id || !pesan) {
    return res.status(400).json({
      success: false,
      message: "ID dan pesan harus diisi",
    });
  }

  const user_id = req.user.id;
  const data = await createPeringatan(user_id, id, pesan);

  res.status(201).json({
    success: true,
    message: "Peringatan berhasil dibuat",
    data,
  });
});

// Get semua peringatan milik user
export const getAllPeringatan = asyncHandler(async (req, res) => {
  const user_id = req.user.id;
  const data = await getPeringatan(user_id);

  res.status(200).json({
    success: true,
    message: "Data peringatan berhasil diambil",
    data,
  });
});
