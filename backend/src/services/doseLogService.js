import { supabase } from "../config/supabaseClient.js";
import { createHistory } from "./historyService.js";
import { sendWhatsAppMessage } from "./messageService.js";
import { formatPhoneNumber } from "./wablasService.js";
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
  // Always compute date in WIB to avoid server timezone differences
  return dayjs(ts).tz(TZ).format("YYYY-MM-DD");
}
function normalizeTimeStr(t) {
  if (!t) return null;
  // Date object -> format HH:mm:ss WIB
  if (t instanceof Date) {
    return dayjs(t).tz(TZ).format("HH:mm:ss");
  }
  const raw = String(t).trim();
  // Already HH:mm:ss
  if (/^\d{2}:\d{2}:\d{2}$/.test(raw)) return raw;
  // HH:mm (or H:mm)
  if (/^\d{1,2}:\d{2}$/.test(raw)) {
    const [h, m] = raw.split(":");
    return `${h.padStart(2, "0")}:${m.padStart(2, "0")}:00`;
  }
  // Compact e.g. 0830 -> 08:30:00
  if (/^\d{3,4}$/.test(raw)) {
    const padded = raw.padStart(4, "0");
    return `${padded.slice(0, 2)}:${padded.slice(2)}:00`;
  }
  return null; // Unrecognized
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

  // Normalisasi semua jam_awal & jam_berakhir ke HH:mm:ss
  const awalList = jam_awal.map(normalizeTimeStr).filter(Boolean);
  const akhirList = jam_berakhir.map(normalizeTimeStr).filter(Boolean);

  const nowWIB = dayjs(takenAt).tz(TZ);
  // Cari interval aktif di WIB (now ∈ [start, end])
  let chosen = null;
  for (let i = 0; i < Math.min(awalList.length, akhirList.length); i++) {
    const startRaw = awalList[i];
    const endRaw = akhirList[i];
    const baseDate = nowWIB.format("YYYY-MM-DD");
    let start = dayjs.tz(`${baseDate} ${startRaw}`, TZ);
    let end = dayjs.tz(`${baseDate} ${endRaw}`, TZ);

    // Lintas tengah malam
    if (end.isBefore(start)) {
      if (nowWIB.isBefore(end)) {
        start = start.subtract(1, "day");
      } else {
        end = end.add(1, "day");
      }
    }

    const within = !nowWIB.isBefore(start) && !nowWIB.isAfter(end);
    if (within) {
      if (!chosen || start.isAfter(chosen.start)) {
        chosen = { idx: i, start, end };
      }
    }
  }

  if (!chosen) {
    // outside all dose windows
    return { ok: false, message: "Diluar semua rentang waktu minum" };
  }

  const idx = chosen.idx;
  const doseTimeFull = awalList[idx]; // HH:mm:ss
  const doseTimeShort = doseTimeFull.slice(0, 5);
  const date_for = chosen.start.format("YYYY-MM-DD"); // tanggal mengacu ke start WIB

  // Cek apakah sudah ada log dengan status taken/missed agar tidak overwrite taken_at
  try {
    const { data: existingRows, error: existingErr } = await supabase
      .from("jadwal_dose_log")
      .select("id,status,taken_at,dose_time")
      .eq("jadwal_id", jadwal_id)
      .eq("date_for", date_for)
      .in("dose_time", [doseTimeFull, doseTimeShort]);
    if (!existingErr && Array.isArray(existingRows) && existingRows.length) {
      // Prefer exact full match
      let existing = existingRows.find((r) => r.dose_time === doseTimeFull);
      if (!existing) existing = existingRows[0];
      if (existing.status === "taken" || existing.status === "missed") {
        return {
          ok: true,
          skipped: true,
          reason: `dose already ${existing.status}`,
          status: existing.status,
          dose_time: existing.dose_time,
          taken_at: existing.taken_at,
          date_for,
        };
      }
    }
  } catch (e) {
    // swallow existing check error
  }
  const nowIso = nowWIB.format();
  // Jika ada row pending -> update, jika tidak ada -> insert baru
  try {
    const { data: pendingRow } = await supabase
      .from("jadwal_dose_log")
      .select("id,status,dose_time")
      .eq("jadwal_id", jadwal_id)
      .eq("date_for", date_for)
      .eq("dose_time", doseTimeFull)
      .single();

    if (pendingRow && pendingRow.status === "pending") {
      const { error: upErr } = await supabase
        .from("jadwal_dose_log")
        .update({ status: "taken", taken_at: nowIso, source })
        .eq("id", pendingRow.id)
        .eq("status", "pending");
      if (upErr) return { ok: false, message: upErr.message };
      return {
        ok: true,
        jadwal_id,
        user_id,
        date_for,
        dose_time: doseTimeFull,
        status: "taken",
        taken_at: nowIso,
        source,
      };
    }
  } catch (e) {}

  const payload = {
    jadwal_id,
    user_id,
    date_for,
    dose_time: doseTimeFull,
    status: "taken",
    taken_at: nowIso, // ISO +07:00
    source,
  };
  const { error } = await supabase.from("jadwal_dose_log").insert(payload);
  if (error) return { ok: false, message: error.message };
  return { ok: true, ...payload };
}

// Create 'pending' rows for all jadwal for today (idempotent)
export async function ensurePendingForTodayAllJadwal() {
  const date_for = toLocalDate(new Date());
  // start ensure pending
  const { data: jadwalList, error } = await supabase
    .from("jadwal")
    .select("id, user_id, jam_awal");
  if (error) {
    // fetch error
    throw new Error("Fetch jadwal failed: " + error.message);
  }
  // jadwal count: (jadwalList?.length || 0)

  let inserted = 0;
  for (const j of jadwalList || []) {
    const jams = Array.isArray(j.jam_awal) ? j.jam_awal : [];
    const rows = jams
      .map((jam) => normalizeTimeStr(jam))
      .filter(Boolean)
      .map((jam) => ({
        jadwal_id: j.id,
        user_id: j.user_id,
        date_for,
        dose_time: jam, // HH:mm:ss
        status: "pending",
      }));
    if (rows.length === 0) continue;
    const { error: insErr } = await supabase
      .from("jadwal_dose_log")
      .upsert(rows, {
        onConflict: "jadwal_id,date_for,dose_time",
        ignoreDuplicates: true,
      });
    if (!insErr) {
      inserted += rows.length;
      // upsert ok
    } else {
      // upsert error
    }
  }

  for (const j of jadwalList || []) {
  }
  // ensurePending done
  return { date_for, inserted };
}

// Mark 'missed' for today when time + grace has passed (best-effort JS-side)
// helper formatter WIB

// Mark 'missed' for today when time + grace has passed (best-effort JS-side)
export async function markMissedForTodayAll() {
  const date_for = dayjs().tz(TZ).format("YYYY-MM-DD");
  // start mark missed

  const { data: rows, error } = await supabase
    .from("jadwal_dose_log")
    .select("id, dose_time, status, jadwal_id, user_id")
    .eq("date_for", date_for)
    .eq("status", "pending");

  if (error) {
    // fetch error
    throw new Error("Fetch pending dose log failed: " + error.message);
  }

  const now = dayjs().tz(TZ);
  // pending count

  let updated = 0;

  for (const r of rows || []) {
    const { data: jadwal, error: jadwalErr } = await supabase
      .from("jadwal")
      .select("jam_awal, jam_berakhir, nama_obat, nama_pasien")
      .eq("id", r.jadwal_id)
      .single();

    if (jadwalErr) {
      // jadwal fetch error
      continue;
    }

    const doseTimeNorm = normalizeTimeStr(r.dose_time);
    const jamAwalNorm = (jadwal.jam_awal || [])
      .map(normalizeTimeStr)
      .filter(Boolean);
    const jamAkhirNorm = (jadwal.jam_berakhir || [])
      .map(normalizeTimeStr)
      .filter(Boolean);

    const idx = jamAwalNorm.findIndex((j) => j === doseTimeNorm);
    if (idx === -1 || !jamAkhirNorm[idx]) {
      console.warn(
        "[markMissed] No matching jam_awal/jam_berakhir for",
        doseTimeNorm
      );
      continue;
    }

    // ?? bikin end pakai dayjs WIB
    const end = dayjs.tz(`${date_for} ${jamAkhirNorm[idx]}`, TZ);
    // compare times

    if (now.isAfter(end)) {
      // update to missed
      const { error: upErr } = await supabase
        .from("jadwal_dose_log")
        .update({ status: "missed" })
        .eq("id", r.id)
        .eq("status", "pending");

      if (upErr) {
        console.error("[markMissed] Update error:", upErr.message);
      } else {
        updated++;
        // Create history entry for missed dose (best-effort)
        try {
          await createHistory(r.user_id, r.jadwal_id, "obat tidak diminum");
          // history created
        } catch (histErr) {
          console.error(
            "[markMissed] Failed to create history for missed dose:",
            histErr?.message || histErr
          );
        }

        // Send WhatsApp message to user about missed dose (best-effort)
        try {
          const { data: profile } = await supabase
            .from("profile")
            .select("no_hp")
            .eq("user_id", r.user_id)
            .single();

          const phone = profile?.no_hp
            ? formatPhoneNumber(profile.no_hp)
            : null;
          // phone ready

          if (phone) {
            const msg =
              `❌ Jadwal obat terlewat\n\n` +
              `👤 Pasien: ${jadwal?.nama_pasien || "-"}\n` +
              `💊 Obat: ${jadwal?.nama_obat || "-"}\n` +
              `⏰ Jadwal: ${doseTimeNorm} (batas ${jamAkhirNorm[idx]})\n\n` +
              `Jika masih diperlukan, silakan minum secepatnya atau lanjutkan ke jadwal berikutnya.`;
            await sendWhatsAppMessage(phone, msg, "text");
            // wa sent
          } else {
            // no phone
          }
        } catch (waErr) {
          console.warn(
            "[markMissed] WA notify failed:",
            waErr?.message || waErr
          );
        }
      }
    } else {
      // within window
    }
  }

  // mark missed done
  return { date_for, updated };
}
