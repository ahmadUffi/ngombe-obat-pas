import {
  ensurePendingForTodayAllJadwal,
  markMissedForTodayAll,
  upsertDoseTakenByIot,
} from "../services/doseLogService.js";

// GET status dosis harian untuk user (Dashboard/IoT)
export const getDoseLogStatusToday = async (req, res) => {
  try {
    const user_id = req.user.id;
    // Pastikan baris pending sudah ada (lazy-generate)
    // await ensurePendingForTodayAllJadwal();
    // Query status harian dari view
    const { data, error } = await req.supabase
      .from("jadwal_status_today")
      .select("*")
      .eq("user_id", user_id);
    if (error) throw new Error(error.message);
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, message: err.message });
  }
};

// // POST tandai dosis diminum (IoT)
// export const takeDoseByIot = async (req, res) => {
//   const { jadwal_id } = req.body;
//   const user_id = req.user?.id || req.body.user_id;
//   try {
//     // Ambil jam_awal dari jadwal
//     const { data: jadwal, error } = await req.supabase
//       .from("jadwal")
//       .select("jam_awal")
//       .eq("id", jadwal_id)
//       .single();
//     if (error || !jadwal) throw new Error("Jadwal tidak ditemukan");
//     // Upsert status taken
//     const result = await upsertDoseTakenByIot({
//       jadwal_id,
//       user_id,
//       jam_awal: jadwal.jam_awal,
//       graceMinutes: 60,
//       takenAt: new Date(),
//       source: "iot",
//     });
//     res.json(result);
//   } catch (err) {
//     res.status(500).json({ ok: false, message: err.message });
//   }
// };
