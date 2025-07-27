import {
  createJadwal,
  deleteJadwal,
  getJadwalByID,
  getJadwalByIDProfile,
  updateObatByID,
} from "../services/jadwalService.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const inputJadwal = asyncHandler(async (req, res) => {
  const user_id = req.user.id;
  await createJadwal(user_id, req.body);

  res.status(201).json({
    success: true,
    message: "Jadwal berhasil dibuat",
  });
});

export const getAllJadwalbyIDForWeb = asyncHandler(async (req, res) => {
  const user_id = req.user.id;
  const jadwals = await getJadwalByID(user_id);

  res.status(200).json(jadwals);
});

export const getAllJadwalbyIDForIot = asyncHandler(async (req, res) => {
  const user_id = req.user.id;
  const jadwals = await getJadwalByIDProfile(user_id);

  res.status(200).json(jadwals);
});

export const updateStockObatByIdForIot = asyncHandler(async (req, res) => {
  const { id_obat } = req.body;

  if (!id_obat) {
    return res.status(400).json({
      success: false,
      message: "ID obat harus diisi",
    });
  }

  const result = await updateObatByID(id_obat, "iot");

  res.status(200).json(result);
});

export const updateStockObatByIdForWeb = asyncHandler(async (req, res) => {
  const { id_obat, newStock } = req.body;

  if (!id_obat || newStock === undefined) {
    return res.status(400).json({
      success: false,
      message: "ID obat dan stock baru harus diisi",
    });
  }

  const result = await updateObatByID(id_obat, "web", newStock);

  res.status(200).json(result);
});

export const deleteJadwalById = asyncHandler(async (req, res) => {
  const user_id = req.user.id;
  const { jadwal_id } = req.body;

  if (!jadwal_id) {
    return res.status(400).json({
      success: false,
      message: "ID jadwal harus diisi",
    });
  }

  await deleteJadwal(jadwal_id, user_id);

  res.status(200).json({
    success: true,
    message: "Jadwal berhasil dihapus",
  });
});
