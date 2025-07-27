import {
  createJadwal,
  deleteJadwal,
  getJadwalByID,
  getJadwalByIDProfile,
  updateObatByID,
} from "../services/jadwalService.js";

export const inputJadwal = async (req, res) => {
  try {
    const user_id = req.user.id; // ✅ ambil dari .id, bukan .sub
    await createJadwal(user_id, req.body);
    return res.status(201).json({
      message: "Jadwal berhasil dibuat",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getAllJadwalbyIDForWeb = async (req, res) => {
  try {
    const user_id = req.user.id; // dari token yang didecode di middleware
    const jadwals = await getJadwalByID(user_id);

    return res.status(200).json(jadwals);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getAllJadwalbyIDForIot = async (req, res) => {
  try {
    const user_id = req.user.id; // dari token yang didecode di middleware
    const jadwals = await getJadwalByIDProfile(user_id);

    return res.status(200).json(jadwals);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const updateStockObatByIdForIot = async (req, res) => {
  const { id_obat } = req.body;
  try {
    const result = await updateObatByID(id_obat, "iot");
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateStockObatByIdForWeb = async (req, res) => {
  const { id_obat, newStock } = req.body;
  try {
    const result = await updateObatByID(id_obat, "web", newStock);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteJadwalById = async (req, res) => {
  const { jadwal_id } = req.params;
  const user_id = req.user.id;

  try {
    await deleteJadwal(jadwal_id, user_id);
    return res.status(200).json({
      success: true,
      message: "Jadwal berhasil dihapus",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
