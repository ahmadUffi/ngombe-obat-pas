import { supabase } from "../config/supabaseClient.js";
import { createHistory } from "./historyService.js";
import {
  createWablasReminder,
  deleteWablasReminder,
  generateReminderMessage,
  formatStartDate,
  formatPhoneNumber,
} from "./wablasService.js";
import {
  createWaReminder,
  getWaRemindersByJadwal,
  deleteWaRemindersByJadwal,
} from "./waReminderService.js";

export const createJadwal = async (user_id, data) => {
  // Get user profile with phone number
  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("id, no_hp, username")
    .eq("user_id", user_id)
    .single();

  if (profileError || !profile) throw new Error("Gagal mengambil profile_id");
  if (!profile.no_hp)
    throw new Error(
      "Nomor HP tidak ditemukan. Mohon lengkapi profile terlebih dahulu."
    );

  // Format phone number
  const formattedPhone = formatPhoneNumber(profile.no_hp);
  if (!formattedPhone) {
    throw new Error("Format nomor HP tidak valid");
  }

  const { data: existSlot, error: cekSlotError } = await supabase
    .from("jadwal")
    .select("slot_obat")
    .eq("user_id", user_id)
    .eq("slot_obat", data.slot_obat);

  if (cekSlotError || existSlot.length > 0)
    throw new Error("Slot obat sudah terisi");

  const insertData = {
    user_id,
    profile_id: profile.id,
    nama_pasien: data.nama_pasien,
    nama_obat: data.nama_obat,
    dosis_obat: data.dosis_obat,
    jumlah_obat: data.jumlah_obat,
    jam_awal: data.jam_awal,
    jam_berakhir: data.jam_berakhir,
    catatan: data.catatan || "",
    kategori: data.kategori || "",
    slot_obat: data.slot_obat || "",
  };

  // Start transaction-like process
  let jadwalResult;
  let reminderIds = []; // Array to collect reminder IDs for cleanup

  try {
    // 1. Insert jadwal to database
    const { data: result, error: errorInput } = await supabase
      .from("jadwal")
      .insert([insertData])
      .select()
      .single();

    if (errorInput) throw new Error(errorInput.message);
    jadwalResult = result;

    // 2. Create WhatsApp reminders for each jam_awal
    if (data.jam_awal && Array.isArray(data.jam_awal)) {
      const jamReminders = [];

      for (const jam of data.jam_awal) {
        // Generate reminder message
        const message = generateReminderMessage(insertData, jam);
        const startDate = formatStartDate(jam);

        // Create reminder in Wablas
        const wablasResponse = await createWablasReminder({
          phone: formattedPhone,
          start_date: startDate,
          message: message,
          title: `Reminder ${insertData.nama_obat} - ${jam}`,
        });

        // Collect reminder data
        jamReminders.push(jam);
        reminderIds.push(wablasResponse.reminder_id);
      }

      // Save all reminder IDs to database in one record
      await createWaReminder({
        jadwal_id: result.id,
        user_id: user_id,
        jam_reminders: jamReminders, // ["08:00", "12:00", "16:00", "20:00"]
        wablas_reminder_ids: reminderIds, // ["id1", "id2", "id3", "id4"]
      });

      console.log(
        `Created ${reminderIds.length} WhatsApp reminders for jadwal:`,
        result.id
      );
    }

    // 3. Create history record for new jadwal
    try {
      await createHistory(user_id, result.id, "jadwal baru dibuat");
    } catch (historyError) {
      console.error("Failed to create history for new jadwal:", historyError);
      // Continue with the function even if history creation fails
    }

    return result;
  } catch (error) {
    console.error("Error creating jadwal with WA reminders:", error);

    // Cleanup: Delete jadwal if it was created
    if (jadwalResult) {
      try {
        await supabase.from("jadwal").delete().eq("id", jadwalResult.id);
      } catch (cleanupError) {
        console.error("Failed to cleanup jadwal:", cleanupError);
      }
    }

    // Cleanup: Delete created Wablas reminders from the collected array
    if (typeof reminderIds !== "undefined" && Array.isArray(reminderIds)) {
      for (const reminderId of reminderIds) {
        try {
          await deleteWablasReminder(reminderId);
        } catch (cleanupError) {
          console.error(
            "Failed to cleanup Wablas reminder:",
            reminderId,
            cleanupError
          );
        }
      }
    }

    throw new Error(
      "Gagal membuat jadwal dan notifikasi WhatsApp: " + error.message
    );
  }
};

export const getJadwalByID = async (user_id) => {
  const { data: result, error } = await supabase
    .from("jadwal")
    .select("*")
    .eq("user_id", user_id);

  if (error) throw new Error("Gagal mengambil data jadwal: " + error.message);
  return result;
};

export const getJadwalByIDProfile = async (user_id) => {
  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("no_hp")
    .eq("user_id", user_id)
    .single();

  if (profileError || !profile)
    throw new Error("Gagal mengambil data profile: " + profileError.message);

  const { data: jadwalList, error: jadwalError } = await supabase
    .from("jadwal")
    .select(
      "id,  nama_pasien, nama_obat, dosis_obat, jumlah_obat, kategori, slot_obat, catatan , jam_awal, jam_berakhir"
    )
    .eq("user_id", user_id);

  if (jadwalError || !jadwalList)
    throw new Error("Gagal mengambil data jadwal: " + jadwalError.message);

  return {
    no_hp: profile.no_hp,
    jadwalMinum: jadwalList.map((jadwal) => ({
      ...jadwal,
    })),
  };
};

export const updateObatByID = async (id_jadwal, own, newStock) => {
  const { data: result, error: errorJumlahObat } = await supabase
    .from("jadwal")
    .select("jumlah_obat, user_id")
    .eq("id", id_jadwal)
    .single();

  if (errorJumlahObat || !result)
    throw new Error(
      "Gagal mengambil data obat: " +
        (errorJumlahObat ? errorJumlahObat.message : "Data tidak ditemukan")
    );

  let stockObat;
  let status;

  if (own == "iot") {
    stockObat = result.jumlah_obat - 1;
    status = "diminum";
  }

  if (own == "web") {
    stockObat = newStock;
    status =
      newStock > result.jumlah_obat ? "stock ditambah" : "stock dikurangi";
  }

  const { data, error: errorUpdate } = await supabase
    .from("jadwal")
    .update({ jumlah_obat: stockObat })
    .eq("id", id_jadwal);

  if (errorUpdate)
    throw new Error("Gagal mengupdate data obat: " + errorUpdate.message);

  // Create history record for stock update
  try {
    const user_id = result.user_id;
    await createHistory(user_id, id_jadwal, status);
  } catch (historyError) {
    console.error("Failed to create history for stock update:", historyError);
    // Continue with the function even if history creation fails
  }

  // Check if stock is empty or very low and add another history entry
  if (stockObat <= 0) {
    try {
      await createHistory(result.user_id, id_jadwal, "stock habis");
    } catch (historyError) {
      console.error("Failed to create 'stock habis' history:", historyError);
    }
  } else if (stockObat <= 5) {
    try {
      await createHistory(result.user_id, id_jadwal, "stock menipis");
    } catch (historyError) {
      console.error("Failed to create 'stock menipis' history:", historyError);
    }
  }
};

export const deleteJadwal = async (id_jadwal, user_id) => {
  // First check if the jadwal belongs to the user
  const { data: jadwal, error: errorCheck } = await supabase
    .from("jadwal")
    .select("*")
    .eq("id", id_jadwal)
    .eq("user_id", user_id)
    .single();

  if (errorCheck || !jadwal) {
    throw new Error("Jadwal tidak ditemukan atau Anda tidak memiliki akses");
  }

  try {
    // 1. Get all WA reminders for this jadwal
    const waReminders = await getWaRemindersByJadwal(id_jadwal);

    // 2. Delete all Wablas reminders by mapping through the arrays
    for (const reminderRecord of waReminders) {
      const { wablas_reminder_ids } = reminderRecord;

      if (wablas_reminder_ids && Array.isArray(wablas_reminder_ids)) {
        for (const reminderId of wablas_reminder_ids) {
          try {
            const deleteResult = await deleteWablasReminder(reminderId);
            if (deleteResult.success) {
              console.log("✅ Deleted Wablas reminder:", reminderId);
            } else {
              console.warn(
                "⚠️ Failed to delete Wablas reminder:",
                deleteResult.error
              );
            }
          } catch (wablasError) {
            console.error(
              "❌ Error deleting Wablas reminder:",
              reminderId,
              wablasError.message
            );
            // Continue with other reminders even if one fails
          }
        }
      }
    }

    // 3. Delete WA reminder records from database
    if (waReminders.length > 0) {
      await deleteWaRemindersByJadwal(id_jadwal);
      const totalReminders = waReminders.reduce(
        (sum, record) => sum + (record.wablas_reminder_ids?.length || 0),
        0
      );
      console.log(`🗑️ Deleted ${totalReminders} WA reminder records`);
    }

    // 4. Create history record before deleting the jadwal
    try {
      const historyData = {
        user_id: user_id,
        profile_id: jadwal.profile_id,
        nama_obat: jadwal.nama_obat,
        dosis_obat: jadwal.dosis_obat,
        sisa_obat: jadwal.jumlah_obat,
        status: "jadwal dihapus",
        waktu_minum: jadwal.jam_awal,
      };

      const { error: createError } = await supabase
        .from("history")
        .insert([historyData]);

      if (createError) {
        console.error(
          "Failed to create history for deleted jadwal:",
          createError.message
        );
      }
    } catch (historyError) {
      console.error("Failed to create history before deletion:", historyError);
    }

    // 5. Finally delete the jadwal (CASCADE will handle WA reminders if any remain)
    const { data, error: errorDelete } = await supabase
      .from("jadwal")
      .delete()
      .eq("id", id_jadwal)
      .eq("user_id", user_id);

    if (errorDelete) {
      throw new Error("Gagal menghapus data jadwal: " + errorDelete.message);
    }

    console.log(
      "Jadwal and all associated reminders deleted successfully:",
      id_jadwal
    );
    return data;
  } catch (error) {
    console.error("Error in deleteJadwal:", error);
    throw new Error(`Gagal menghapus jadwal dan notifikasi: ${error.message}`);
  }
};

// Recreate all WA reminders for all jadwal of a user with a new phone number
export const recreateAllWaRemindersForUser = async (user_id, newPhone) => {
  // Validate and format new phone using existing helper
  const formattedPhone = formatPhoneNumber(newPhone);
  if (!formattedPhone) {
    throw new Error("Format nomor HP tidak valid untuk regenerasi reminder");
  }

  // 1) Fetch all jadwal for this user (we need nama_obat, jam_awal, etc.)
  const { data: jadwalList, error: jadwalError } = await supabase
    .from("jadwal")
    .select(
      "id, user_id, profile_id, nama_obat, dosis_obat, jumlah_obat, nama_pasien, jam_awal, jam_berakhir, catatan, kategori, slot_obat"
    )
    .eq("user_id", user_id);

  if (jadwalError) {
    throw new Error("Gagal mengambil data jadwal: " + jadwalError.message);
  }

  let totalDeleted = 0;
  let totalCreated = 0;

  // 2) For each jadwal: delete existing Wablas reminders, then recreate with the new phone
  for (const jadwal of jadwalList || []) {
    try {
      // Get any existing reminder records for this jadwal
      const waReminders = await getWaRemindersByJadwal(jadwal.id);

      // Delete existing reminders in Wablas
      for (const reminderRecord of waReminders) {
        const { wablas_reminder_ids } = reminderRecord;
        if (Array.isArray(wablas_reminder_ids)) {
          for (const reminderId of wablas_reminder_ids) {
            try {
              const result = await deleteWablasReminder(reminderId);
              if (result?.success) totalDeleted += 1;
            } catch (e) {
              // Continue deleting other reminders even if one fails
              console.warn(
                "Gagal menghapus Wablas reminder:",
                reminderId,
                e?.message
              );
            }
          }
        }
      }

      // Remove reminder records for this jadwal in our DB
      if (waReminders.length > 0) {
        await deleteWaRemindersByJadwal(jadwal.id);
      }

      // Recreate reminders if jadwal has jam_awal array
      if (Array.isArray(jadwal.jam_awal) && jadwal.jam_awal.length > 0) {
        const jamReminders = [];
        const reminderIds = [];

        for (const jam of jadwal.jam_awal) {
          try {
            const message = generateReminderMessage(jadwal, jam);
            const startDate = formatStartDate(jam);
            const wablasResponse = await createWablasReminder({
              phone: formattedPhone,
              start_date: startDate,
              message,
              title: `Reminder ${jadwal.nama_obat} - ${jam}`,
            });
            jamReminders.push(jam);
            reminderIds.push(wablasResponse.reminder_id);
            totalCreated += 1;
          } catch (e) {
            console.error(
              "Gagal membuat ulang Wablas reminder untuk jadwal:",
              jadwal.id,
              e?.message
            );
          }
        }

        // Save new reminder record for this jadwal
        if (reminderIds.length > 0) {
          await createWaReminder({
            jadwal_id: jadwal.id,
            user_id,
            jam_reminders: jamReminders,
            wablas_reminder_ids: reminderIds,
          });
        }
      }
    } catch (err) {
      console.error(
        "Gagal recreate WA reminders untuk jadwal:",
        jadwal.id,
        err?.message
      );
      // Continue other jadwal
    }
  }

  return { totalDeleted, totalCreated, totalJadwal: jadwalList?.length || 0 };
};
