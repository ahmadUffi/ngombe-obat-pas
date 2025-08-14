import { supabase } from "../config/supabaseClient.js";
import { sendWhatsAppMessage } from "./messageService.js";
import {
  formatPhoneNumber,
  createWablasReminder,
  deleteWablasReminder,
} from "./wablasService.js";
import {
  getWaRemindersByJadwal,
  deleteWaRemindersByJadwal,
  createWaReminder,
} from "./waReminderService.js";

// --- Helpers ---

// Get user phone formatted for Wablas (62...)
async function getFormattedPhoneByUserId(user_id) {
  const { data: profile } = await supabase
    .from("profile")
    .select("no_hp")
    .eq("user_id", user_id)
    .single();
  if (!profile?.no_hp) return null;
  return formatPhoneNumber(profile.no_hp);
}

// Pause (delete) all Wablas reminders for a specific jadwal and remove DB records
async function pauseJadwalReminders(jadwal_id) {
  const waReminders = await getWaRemindersByJadwal(jadwal_id);
  for (const reminderRecord of waReminders) {
    const ids = reminderRecord.wablas_reminder_ids || [];
    for (const reminderId of ids) {
      try {
        await deleteWablasReminder(reminderId);
      } catch (e) {
        console.warn(
          "StockCron: delete Wablas reminder failed",
          reminderId,
          e?.message || e
        );
      }
    }
  }
  if (waReminders.length > 0) {
    await deleteWaRemindersByJadwal(jadwal_id);
  }
}

// Recreate WA reminders for one jadwal after refill (not used directly by cron)
async function recreateWaRemindersForJadwal(jadwal) {
  const phone = await getFormattedPhoneByUserId(jadwal.user_id);
  if (!phone) return;

  const jamReminders = [];
  const reminderIds = [];

  if (Array.isArray(jadwal.jam_awal)) {
    for (const jam of jadwal.jam_awal) {
      const now = new Date();
      const [h, m] = String(jam).split(":");
      const d = new Date(now);
      d.setHours(parseInt(h || 0), parseInt(m || 0), 0, 0);
      if (d <= now) d.setDate(d.getDate() + 1);
      const start_date = `${d.getFullYear()}-${String(
        d.getMonth() + 1
      ).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(
        d.getHours()
      ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:00`;

      try {
        const resp = await createWablasReminder({
          phone,
          start_date,
          message: `⏰ Pengingat minum obat ${jadwal.nama_obat} - ${jam}`,
          title: `Reminder ${jadwal.nama_obat} - ${jam}`,
        });
        jamReminders.push(jam);
        if (resp?.reminder_id) reminderIds.push(resp.reminder_id);
      } catch (e) {
        console.warn(
          "StockCron: create reminder failed for jam",
          jam,
          e?.message || e
        );
      }
    }
  }

  if (reminderIds.length > 0) {
    await createWaReminder({
      jadwal_id: jadwal.id,
      user_id: jadwal.user_id,
      jam_reminders: jamReminders,
      wablas_reminder_ids: reminderIds,
    });
  }
}

async function createHistorySafe({
  user_id,
  profile_id,
  jadwal,
  status,
  sisa,
}) {
  try {
    await supabase.from("history").insert([
      {
        user_id,
        profile_id,
        nama_obat: jadwal.nama_obat,
        dosis_obat: String(jadwal.dosis_obat ?? ""),
        sisa_obat: String(sisa ?? ""),
        status,
        waktu_minum: jadwal.jam_awal || [],
      },
    ]);
  } catch (e) {
    console.warn("StockCron: create history failed", e?.message || e);
  }
}

// --- Cron entrypoint ---
export async function checkAllJadwalStockAndNotify() {
  const { data: list, error } = await supabase
    .from("jadwal")
    .select(
      "id, user_id, profile_id, nama_obat, nama_pasien, dosis_obat, jumlah_obat, jam_awal"
    );
  if (error) {
    console.error("StockCron: fetch jadwal error", error.message);
    return { success: false, error: error.message };
  }

  let lowCount = 0;
  let emptyCount = 0;

  for (const jadwal of list || []) {
    const dosesPerDay =
      Array.isArray(jadwal.jam_awal) && jadwal.jam_awal.length > 0
        ? jadwal.jam_awal.length
        : 1;
    const threshold = dosesPerDay * 3; // ~3 days left
    const stok = Number(jadwal.jumlah_obat || 0);

    try {
      if (stok <= 0) {
        // Always pause reminders and notify while condition holds
        await pauseJadwalReminders(jadwal.id);

        const phone = await getFormattedPhoneByUserId(jadwal.user_id);
        if (phone) {
          await sendWhatsAppMessage(
            phone,
            `⛔ Stok obat habis\n\nObat: ${jadwal.nama_obat}\nPasien: ${jadwal.nama_pasien}\n\nPengingat dihentikan. Silakan isi ulang di SmedBox.`,
            "text"
          );
        }

        await createHistorySafe({
          user_id: jadwal.user_id,
          profile_id: jadwal.profile_id,
          jadwal,
          status: "cron: stock habis",
          sisa: 0,
        });

        emptyCount++;
      } else if (stok <= threshold) {
        // Always notify while low stock condition holds
        const phone = await getFormattedPhoneByUserId(jadwal.user_id);
        if (phone) {
          const daysLeft = Math.max(
            0,
            Math.floor(stok / Math.max(1, dosesPerDay))
          );
          await sendWhatsAppMessage(
            phone,
            `⚠️ Stok obat menipis\n\nObat: ${jadwal.nama_obat}\nSisa: ${stok} butir\nPerkiraan cukup: ${daysLeft} hari\n\nIsi ulang sekarang agar tidak terlewat.`,
            "text"
          );
        }

        await createHistorySafe({
          user_id: jadwal.user_id,
          profile_id: jadwal.profile_id,
          jadwal,
          status: "cron: stock menipis",
          sisa: stok,
        });

        lowCount++;
      }
    } catch (e) {
      console.warn(
        "StockCron: handle jadwal failed",
        jadwal.id,
        e?.message || e
      );
    }
  }

  return { success: true, total: list?.length || 0, lowCount, emptyCount };
}
