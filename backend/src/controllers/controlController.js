import {
  createControl,
  getControl,
  updateIsDone,
  updateControl,
  deleteControl,
} from "../services/controlService.js";

// ✅ Create Kontrol
export const createKontrol = async (req, res) => {
  const user_id = req.user.id;
  const { tanggal, dokter, waktu, nama_pasien } = req.body;

  try {
    const newKontrol = await createControl(user_id, {
      tanggal,
      dokter,
      waktu,
      nama_pasien,
    });
    return res.status(201).json({
      success: true,
      message: "Kontrol berhasil dibuat",
      data: newKontrol,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal membuat kontrol",
      error: error.message,
    });
  }
};

//  Get All Kontrol for User
export const getAllKontrol = async (req, res) => {
  const user_id = req.user.id;

  try {
    const kontrols = await getControl(user_id);
    return res.status(200).json({
      success: true,
      message: "Data kontrol berhasil diambil",
      data: kontrols,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data kontrol",
      error: error.message,
    });
  }
};

// Update isDone Status
export const setKontrolIsDone = async (req, res) => {
  const { id, isDone } = req.body;

  try {
    const updated = await updateIsDone(id, isDone);
    return res.status(200).json({
      success: true,
      message: "Status isDone berhasil diupdate",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal update status isDone",
      error: error.message,
    });
  }
};

//  Update Kontrol Data (tanggal, dokter, waktu)
export const editKontrol = async (req, res) => {
  const { id } = req.params;
  const { tanggal, dokter, waktu, nama_pasien } = req.body;

  try {
    const updated = await updateControl(id, {
      tanggal,
      dokter,
      waktu,
      nama_pasien,
    });
    return res.status(200).json({
      success: true,
      message: "Kontrol berhasil diupdate",
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal update kontrol",
      error: error.message,
    });
  }
};

// Delete Kontrol
export const deleteKontrol = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    await deleteControl(id, user_id);
    return res.status(200).json({
      success: true,
      message: "Kontrol berhasil dihapus",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus kontrol",
      error: error.message,
    });
  }
};
