import { supabase } from "../config/supabaseClient.js";

// Utilities
function toLocalDate(ts = new Date()) {
  // Use server local time (DB already in Jakarta per setup)
  const y = ts.getFullYear();
  const m = String(ts.getMonth() + 1).padStart(2, "0");
  const d = String(ts.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`; // YYYY-MM-DD
}

function parseHHMM(str) {
  const [h, m] = String(str || "").split(":");
  const hh = Math.max(0, Math.min(23, parseInt(h || 0)));
  const mm = Math.max(0, Math.min(59, parseInt(m || 0)));
  return { hh, mm };
}

function minutesDiffLocal(now, hhmm) {
  const { hh, mm } = parseHHMM(hhmm);
  // Build local datetime for dose time
  const nowLocal = new Date(now);
  const sched = new Date(nowLocal);
  sched.setHours(hh, mm, 0, 0);
  return Math.round((nowLocal.getTime() - sched.getTime()) / 60000); // minutes now - sched
}

function findClosestDose(jamList, now = new Date()) {
  let best = null;
  let minAbs = Infinity;
  for (const jam of Array.isArray(jamList) ? jamList : []) {
    try {
      const diffMin = minutesDiffLocal(now, jam);
      const abs = Math.abs(diffMin);
      if (abs < minAbs) {
        minAbs = abs;
        best = { jam, diffMin };
      }
    } catch {}
  }
  return best; // { jam: 'HH:MM', diffMin: signed minutes }
}

// Upsert a 'taken' record for closest dose time within grace window
export async function upsertDoseTakenByIot({
  jadwal_id,
  user_id,
  jam_awal,
  jam_berakhir,
  takenAt = new Date(),
  source = "iot",
}) {
  if (!Array.isArray(jam_awal) || jam_awal.length === 0)
    return { ok: false, message: "No jam_awal" };
  if (!Array.isArray(jam_berakhir) || jam_berakhir.length === 0)
    return { ok: false, message: "No jam_berakhir" };
  const closest = findClosestDose(jam_awal, takenAt);
  if (!closest) return { ok: false, message: "No closest dose" };

  // Cari index jam_awal yang cocok
  const idx = jam_awal.findIndex((j) => j === closest.jam);
  if (idx === -1 || typeof jam_berakhir[idx] === "undefined")
    return { ok: false, message: "No matching jam_berakhir" };

  const todayStr = toLocalDate(takenAt);
  const [hhAwal, mmAwal] = closest.jam.split(":");
  const [hhAkhir, mmAkhir] = jam_berakhir[idx].split(":");
  const start = new Date(takenAt);
  start.setHours(Number(hhAwal), Number(mmAwal), 0, 0);
  const end = new Date(takenAt);
  end.setHours(Number(hhAkhir), Number(mmAkhir), 0, 0);
  if (takenAt < start || takenAt > end) {
    return {
      ok: false,
      message: `Diluar rentang waktu minum (${closest.jam} - ${jam_berakhir[idx]})`,
      dose_time: closest.jam,
    };
  }

  const date_for = todayStr;
  const payload = {
    jadwal_id,
    user_id,
    date_for,
    dose_time: closest.jam,
    status: "taken",
    taken_at: takenAt.toISOString(),
    source,
  };

  const { error } = await supabase
    .from("jadwal_dose_log")
    .upsert(payload, { onConflict: "jadwal_id, date_for, dose_time" });

  if (error) return { ok: false, message: error.message };
  return { ok: true, date_for, dose_time: closest.jam, status: "taken" };
}

// Create 'pending' rows for all jadwal for today (idempotent)
export async function ensurePendingForTodayAllJadwal() {
  const date_for = toLocalDate(new Date());
  const { data: jadwalList, error } = await supabase
    .from("jadwal")
    .select("id, user_id, jam_awal");
  if (error) throw new Error("Fetch jadwal failed: " + error.message);

  let inserted = 0;
  for (const j of jadwalList || []) {
    const jams = Array.isArray(j.jam_awal) ? j.jam_awal : [];
    const rows = jams.map((jam) => ({
      jadwal_id: j.id,
      user_id: j.user_id,
      date_for,
      dose_time: jam,
      status: "pending",
    }));
    if (rows.length === 0) continue;
    const { error: insErr } = await supabase
      .from("jadwal_dose_log")
      .upsert(rows, {
        onConflict: "jadwal_id,date_for,dose_time",
        ignoreDuplicates: true,
      });
    if (!insErr) inserted += rows.length;
  }
  return { date_for, inserted };
}

// Mark 'missed' for today when time + grace has passed (best-effort JS-side)
export async function markMissedForTodayAll() {
  const date_for = toLocalDate(new Date());
  // Ambil jadwal_dose_log pending beserta jadwal_berakhir dari tabel jadwal
  const { data: rows, error } = await supabase
    .from("jadwal_dose_log")
    .select("id, dose_time, status, jadwal_id")
    .eq("date_for", date_for)
    .eq("status", "pending");
  if (error) throw new Error("Fetch pending dose log failed: " + error.message);

  let updated = 0;
  const now = new Date();
  for (const r of rows || []) {
    // Ambil jam_awal dan jam_berakhir dari jadwal
    const { data: jadwal, error: jadwalErr } = await supabase
      .from("jadwal")
      .select("jam_awal, jam_berakhir")
      .eq("id", r.jadwal_id)
      .single();
    if (jadwalErr || !jadwal?.jam_awal || !jadwal?.jam_berakhir) continue;
    // Cari index dose_time pada jam_awal
    const idx = Array.isArray(jadwal.jam_awal)
      ? jadwal.jam_awal.findIndex((j) => j === r.dose_time)
      : -1;
    if (
      idx === -1 ||
      !Array.isArray(jadwal.jam_berakhir) ||
      typeof jadwal.jam_berakhir[idx] === "undefined"
    )
      continue;
    const [hhAkhir, mmAkhir] = jadwal.jam_berakhir[idx].split(":");
    const end = new Date(now);
    end.setHours(Number(hhAkhir), Number(mmAkhir), 0, 0);
    if (now > end) {
      const { error: upErr } = await supabase
        .from("jadwal_dose_log")
        .update({ status: "missed" })
        .eq("id", r.id)
        .eq("status", "pending");
      if (!upErr) updated += 1;
    }
  }
  return { date_for, updated };
}
