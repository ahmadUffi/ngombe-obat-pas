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

// Debug helper for consistent logs
function dbg(tag, obj = undefined) {
  try {
    if (obj !== undefined) {
      console.log(`[DoseLog:${tag}]`, obj);
    } else {
      console.log(`[DoseLog:${tag}]`);
    }
  } catch {}
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
  dbg("upsert:start", { jadwal_id, user_id, takenAt: fmtWIB(takenAt) });
  if (!Array.isArray(jam_awal) || jam_awal.length === 0)
    return { ok: false, message: "No jam_awal" };
  if (!Array.isArray(jam_berakhir) || jam_berakhir.length === 0)
    return { ok: false, message: "No jam_berakhir" };

  // Normalisasi semua jam_awal & jam_berakhir ke HH:mm:ss
  const awalList = jam_awal.map(normalizeTimeStr).filter(Boolean);
  const akhirList = jam_berakhir.map(normalizeTimeStr).filter(Boolean);

  // findClosestDose bekerja dengan HH:mm; kirim versi tanpa detik
  const awalListForCalc = awalList.map((t) => t.slice(0, 5));
  const closest = findClosestDose(awalListForCalc, takenAt);
  if (!closest) return { ok: false, message: "No closest dose" };
  dbg("upsert:closest", closest);

  const idx = awalList.findIndex((j) => j.slice(0, 5) === closest.jam);
  if (idx === -1 || typeof akhirList[idx] === "undefined")
    return { ok: false, message: "No matching jam_berakhir" };

  const nowWIB = dayjs(takenAt).tz(TZ);
  const [hhStart, mmStart] = closest.jam.split(":");
  const start = nowWIB
    .hour(Number(hhStart))
    .minute(Number(mmStart))
    .second(0)
    .millisecond(0);
  const [hhAkhir, mmAkhir] = akhirList[idx].split(":");
  let end = nowWIB
    .hour(Number(hhAkhir))
    .minute(Number(mmAkhir))
    .second(0)
    .millisecond(0);

  // Jika jam_berakhir < jam_awal ? berarti lewat tengah malam, tambahkan 1 hari
  if (end.isBefore(start)) {
    end = end.add(1, "day");
  }

  if (nowWIB.isBefore(start) || nowWIB.isAfter(end)) {
    dbg("upsert:out_of_range", {
      start: start.format(),
      end: end.format(),
      now: nowWIB.format(),
    });
    return {
      ok: false,
      message: `Diluar rentang waktu minum (${closest.jam} - ${akhirList[
        idx
      ].slice(0, 5)})`,
      dose_time: closest.jam + ":00" ? closest.jam : closest.jam, // closest.jam format HH:mm
    };
  }

  const date_for = nowWIB.format("YYYY-MM-DD");
  // Dose time disimpan konsisten HH:mm:ss
  const doseTimeFull = awalList[idx]; // sudah HH:mm:ss
  const doseTimeShort = doseTimeFull.slice(0, 5);

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
        dbg("upsert:skip_existing", existing);
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
    dbg("upsert:existing_check_err", e?.message || e);
  }
  const payload = {
    jadwal_id,
    user_id,
    date_for,
    dose_time: doseTimeFull,
    status: "taken",
    taken_at: nowWIB.format(), // local ISO +07:00
    source,
  };

  const { error } = await supabase
    .from("jadwal_dose_log")
    .upsert(payload, { onConflict: "jadwal_id, date_for, dose_time" });

  if (error) return { ok: false, message: error.message };
  dbg("upsert:upsert_ok", payload);
  return { ok: true, ...payload };
}

// Create 'pending' rows for all jadwal for today (idempotent)
export async function ensurePendingForTodayAllJadwal() {
  const date_for = toLocalDate(new Date());
  dbg("ensurePending:start", { date_for, tz: TZ, now: fmtWIB(new Date()) });
  const { data: jadwalList, error } = await supabase
    .from("jadwal")
    .select("id, user_id, jam_awal");
  if (error) {
    dbg("ensurePending:fetch_error", error.message);
    throw new Error("Fetch jadwal failed: " + error.message);
  }
  dbg("ensurePending:jadwal_count", jadwalList?.length || 0);

  let inserted = 0;
  for (const j of jadwalList || []) {
    dbg("ensurePending:processing_jadwal", {
      id: j.id,
      user_id: j.user_id,
      jam_count: Array.isArray(j.jam_awal) ? j.jam_awal.length : 0,
    });
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
      dbg("ensurePending:upsert_ok", { jadwal_id: j.id, rows: rows.length });
    } else {
      dbg("ensurePending:upsert_error", insErr.message);
    }
  }

  for (const j of jadwalList || []) {
  }
  dbg("ensurePending:done", { date_for, inserted });
  return { date_for, inserted };
}

// Mark 'missed' for today when time + grace has passed (best-effort JS-side)
// helper formatter WIB

// Mark 'missed' for today when time + grace has passed (best-effort JS-side)
export async function markMissedForTodayAll() {
  const date_for = dayjs().tz(TZ).format("YYYY-MM-DD");
  dbg("missed:start", { date_for, tz: TZ, now: fmtWIB(new Date()) });

  const { data: rows, error } = await supabase
    .from("jadwal_dose_log")
    .select("id, dose_time, status, jadwal_id, user_id")
    .eq("date_for", date_for)
    .eq("status", "pending");

  if (error) {
    dbg("missed:fetch_error", error.message);
    throw new Error("Fetch pending dose log failed: " + error.message);
  }

  const now = dayjs().tz(TZ);
  dbg("missed:pending_count", rows?.length || 0);

  let updated = 0;

  for (const r of rows || []) {
    dbg("missed:row", r);
    const { data: jadwal, error: jadwalErr } = await supabase
      .from("jadwal")
      .select("jam_awal, jam_berakhir, nama_obat, nama_pasien")
      .eq("id", r.jadwal_id)
      .single();

    if (jadwalErr) {
      dbg("missed:jadwal_fetch_error", {
        id: r.jadwal_id,
        error: jadwalErr.message,
      });
      continue;
    }

    const doseTimeNorm = normalizeTimeStr(r.dose_time);
    const jamAwalNorm = (jadwal.jam_awal || [])
      .map(normalizeTimeStr)
      .filter(Boolean);
    const jamAkhirNorm = (jadwal.jam_berakhir || [])
      .map(normalizeTimeStr)
      .filter(Boolean);
    dbg("missed:times", {
      dose: doseTimeNorm,
      startList: jamAwalNorm,
      endList: jamAkhirNorm,
    });

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
    dbg("missed:compare", { now: fmtWIB(now), end: fmtWIB(end) });

    if (now.isAfter(end)) {
      dbg("missed:update_to_missed", { id: r.id, dose: doseTimeNorm });
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
          dbg("missed:history_created", { jadwal_id: r.jadwal_id });
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
          dbg("missed:phone", { phone });

          if (phone) {
            const msg =
              `❌ Jadwal obat terlewat\n\n` +
              `👤 Pasien: ${jadwal?.nama_pasien || "-"}\n` +
              `💊 Obat: ${jadwal?.nama_obat || "-"}\n` +
              `⏰ Jadwal: ${doseTimeNorm} (batas ${jamAkhirNorm[idx]})\n\n` +
              `Jika masih diperlukan, silakan minum secepatnya atau lanjutkan ke jadwal berikutnya.`;
            await sendWhatsAppMessage(phone, msg, "text");
            dbg("missed:wa_sent", { phone });
          } else {
            dbg("missed:no_phone", { user_id: r.user_id });
          }
        } catch (waErr) {
          console.warn(
            "[markMissed] WA notify failed:",
            waErr?.message || waErr
          );
        }
      }
    } else {
      dbg("missed:within_window", { dose: doseTimeNorm, end: fmtWIB(end) });
    }
  }

  dbg("missed:done", { date_for, updated });
  return { date_for, updated };
}
