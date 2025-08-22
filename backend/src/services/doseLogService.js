import { supabase } from "../config/supabaseClient.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "Asia/Jakarta";

function fmtWIB(d) {
  return dayjs(d).tz(TZ).format("DD/MM/YYYY, HH:mm:ss");
}

// Utilities
function toLocalDate(ts = new Date()) {
  // Use server local time (DB already in Jakarta per setup)
  const y = ts.getFullYear();
  const m = String(ts.getMonth() + 1).padStart(2, "0");
  const d = String(ts.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`; // YYYY-MM-DD
}
function normalizeTimeStr(t) {
  if (!t) return null;
  // Supabase bisa kirim "13:26:00" atau Date object
  if (t instanceof Date) {
    return t.toTimeString().slice(0, 8); // "HH:MM:SS"
  }
  return String(t).padStart(8, "0").slice(0, 8); // jaga panjang 8 char
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
// helper formatter WIB

// Mark 'missed' for today when time + grace has passed (best-effort JS-side)
export async function markMissedForTodayAll() {
  const date_for = dayjs().tz(TZ).format("YYYY-MM-DD");
  console.log("[markMissed] Running for date:", date_for);

  const { data: rows, error } = await supabase
    .from("jadwal_dose_log")
    .select("id, dose_time, status, jadwal_id")
    .eq("date_for", date_for)
    .eq("status", "pending");

  if (error) {
    console.error("[markMissed] Fetch pending dose log failed:", error.message);
    throw new Error("Fetch pending dose log failed: " + error.message);
  }

  console.log("[markMissed] Pending rows:", rows?.length);

  const now = dayjs().tz(TZ);
  console.log("[markMissed] Current time:", fmtWIB(now));

  let updated = 0;

  for (const r of rows || []) {
    console.log("\n[markMissed] Checking dose log:", r);

    const { data: jadwal, error: jadwalErr } = await supabase
      .from("jadwal")
      .select("jam_awal, jam_berakhir")
      .eq("id", r.jadwal_id)
      .single();

    if (jadwalErr) {
      console.error("[markMissed] Jadwal fetch error:", jadwalErr.message);
      continue;
    }
    console.log("[markMissed] Jadwal:", jadwal);

    const doseTimeNorm = normalizeTimeStr(r.dose_time);
    const jamAwalNorm = (jadwal.jam_awal || []).map(normalizeTimeStr);
    const jamAkhirNorm = (jadwal.jam_berakhir || []).map(normalizeTimeStr);

    console.log(
      "[markMissed] Normalized times -> dose:",
      doseTimeNorm,
      "jam_awal:",
      jamAwalNorm,
      "jam_akhir:",
      jamAkhirNorm
    );

    const idx = jamAwalNorm.findIndex((j) => j === doseTimeNorm);
    if (idx === -1 || !jamAkhirNorm[idx]) {
      console.warn(
        "[markMissed] No matching jam_awal/jam_berakhir for",
        doseTimeNorm
      );
      continue;
    }

    // 👉 bikin end pakai dayjs WIB
    const end = dayjs.tz(`${date_for} ${jamAkhirNorm[idx]}`, TZ);

    console.log(
      `[markMissed] Comparing now=${fmtWIB(now)} vs end=${fmtWIB(end)} (WIB)`
    );

    if (now.isAfter(end)) {
      console.log(
        `[markMissed] ✅ Marking as missed: id=${r.id}, dose=${doseTimeNorm}`
      );
      const { error: upErr } = await supabase
        .from("jadwal_dose_log")
        .update({ status: "missed" })
        .eq("id", r.id)
        .eq("status", "pending");

      if (upErr) {
        console.error("[markMissed] Update error:", upErr.message);
      } else {
        updated++;
        console.log("[markMissed] Updated success for id:", r.id);
      }
    } else {
      console.log(
        `[markMissed] ⏳ Still within range: dose=${doseTimeNorm}, end=${fmtWIB(
          end
        )}`
      );
    }
  }

  console.log("[markMissed] Finished. Total updated:", updated);
  return { date_for, updated };
}
