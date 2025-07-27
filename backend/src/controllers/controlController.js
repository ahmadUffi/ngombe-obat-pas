import {
  createControl,
  getControl,
  updateIsDone,
  updateControl,
} from "../services/controlService.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// Create Kontrol
export const createKontrol = asyncHandler(async (req, res) => {
  const user_id = req.user.id;
  const { tanggal, dokter, waktu, nama_pasien } = req.body;

  if (!tanggal || !dokter || !waktu || !nama_pasien) {
    return res.status(400).json({
      success: false,
      message: "Semua field harus diisi",
    });
  }

  const newKontrol = await createControl(user_id, {
    tanggal,
    dokter,
    waktu,
    nama_pasien,
  });

  res.status(201).json({
    success: true,
    message: "Kontrol berhasil dibuat",
    data: newKontrol,
  });
});

// Get All Kontrol for User
export const getAllKontrol = asyncHandler(async (req, res) => {
  const user_id = req.user.id;
  const kontrols = await getControl(user_id);

  res.status(200).json({
    success: true,
    message: "Data kontrol berhasil diambil",
    data: kontrols,
  });
});

// Update isDone Status
export const setKontrolIsDone = asyncHandler(async (req, res) => {
  const { id, isDone } = req.body;

  if (!id || isDone === undefined) {
    return res.status(400).json({
      success: false,
      message: "ID dan status isDone harus diisi",
    });
  }

  await updateIsDone(id, isDone);

  res.status(200).json({
    success: true,
    message: "Status isDone berhasil diupdate",
  });
});

// Update Kontrol Data
export const editKontrol = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { tanggal, dokter, waktu, nama_pasien } = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "ID kontrol harus diisi",
    });
  }

  const updated = await updateControl(id, {
    tanggal,
    dokter,
    waktu,
    nama_pasien,
  });

  res.status(200).json({
    success: true,
    message: "Kontrol berhasil diupdate",
    data: updated,
  });
});
