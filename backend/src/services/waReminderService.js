import { supabase } from "../config/supabaseClient.js";

// Create WA Reminder record with arrays
export const createWaReminder = async (data) => {
  const { jadwal_id, user_id, jam_reminders, wablas_reminder_ids } = data;

  const { data: result, error } = await supabase
    .from("jadwal_wa_reminders")
    .insert([
      {
        jadwal_id,
        user_id,
        jam_reminders, // Array: ["08:00", "12:00", "16:00", "20:00"]
        wablas_reminder_ids, // Array: ["id1", "id2", "id3", "id4"]
        is_active: true,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error("Failed to create WA reminder record: " + error.message);
  }

  return result;
};

// Get WA Reminders by jadwal_id
export const getWaRemindersByJadwal = async (jadwal_id) => {
  const { data, error } = await supabase
    .from("jadwal_wa_reminders")
    .select("*")
    .eq("jadwal_id", jadwal_id)
    .eq("is_active", true);

  if (error) {
    throw new Error("Failed to get WA reminders: " + error.message);
  }

  return data;
};

// Delete WA Reminders by jadwal_id
export const deleteWaRemindersByJadwal = async (jadwal_id) => {
  const { data, error } = await supabase
    .from("jadwal_wa_reminders")
    .delete()
    .eq("jadwal_id", jadwal_id)
    .select();

  if (error) {
    throw new Error("Failed to delete WA reminders: " + error.message);
  }

  return data;
};

// Deactivate WA Reminders by jadwal_id
export const deactivateWaRemindersByJadwal = async (jadwal_id) => {
  const { data, error } = await supabase
    .from("jadwal_wa_reminders")
    .update({ is_active: false })
    .eq("jadwal_id", jadwal_id)
    .select();

  if (error) {
    throw new Error("Failed to deactivate WA reminders: " + error.message);
  }

  return data;
};

// Get all active reminders for user
export const getUserActiveReminders = async (user_id) => {
  const { data, error } = await supabase
    .from("jadwal_wa_reminders")
    .select(
      `
      *,
      jadwal:jadwal_id (
        nama_obat,
        dosis_obat,
        nama_pasien
      )
    `
    )
    .eq("user_id", user_id)
    .eq("is_active", true);

  if (error) {
    throw new Error("Failed to get user active reminders: " + error.message);
  }

  return data;
};
