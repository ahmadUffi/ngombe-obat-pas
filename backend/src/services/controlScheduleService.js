import { supabase } from "../config/supabaseClient.js";

/**
 * Create control schedule reminder record in database
 * Updated to use kontrol_wa_reminders table
 */
export const createControlScheduleReminder = async (data) => {
  const {
    kontrol_id,
    user_id,
    reminder_types,
    reminder_times,
    wablas_schedule_ids,
  } = data;

  const { data: result, error } = await supabase
    .from("kontrol_wa_reminders")
    .insert([
      {
        kontrol_id,
        user_id,
        reminder_types,
        reminder_times,
        wablas_schedule_ids,
        is_active: true,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(
      "Failed to create control schedule reminder record: " + error.message
    );
  }

  return result;
};

/**
 * Get schedule reminders by kontrol_id
 */
export const getScheduleRemindersByControl = async (kontrol_id) => {
  const { data, error } = await supabase
    .from("kontrol_wa_reminders")
    .select("*")
    .eq("kontrol_id", kontrol_id)
    .eq("is_active", true);

  if (error) {
    throw new Error("Failed to get schedule reminders: " + error.message);
  }

  return data;
};

/**
 * Delete schedule reminders by kontrol_id
 */
export const deleteScheduleRemindersByControl = async (kontrol_id) => {
  const { data, error } = await supabase
    .from("kontrol_wa_reminders")
    .delete()
    .eq("kontrol_id", kontrol_id)
    .select();

  if (error) {
    throw new Error("Failed to delete schedule reminders: " + error.message);
  }

  return data;
};

/**
 * Get all active schedule reminders for user
 */
export const getUserActiveScheduleReminders = async (user_id) => {
  const { data, error } = await supabase
    .from("kontrol_wa_reminders")
    .select(
      `
      *,
      kontrol:kontrol_id (
        tanggal,
        dokter,
        waktu,
        nama_pasien
      )
    `
    )
    .eq("user_id", user_id)
    .eq("is_active", true);

  if (error) {
    throw new Error(
      "Failed to get user active schedule reminders: " + error.message
    );
  }

  return data;
};

/**
 * Update reminder status to inactive
 */
export const deactivateScheduleReminder = async (id) => {
  const { data, error } = await supabase
    .from("kontrol_wa_reminders")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select();

  if (error) {
    throw new Error("Failed to deactivate schedule reminder: " + error.message);
  }

  return data;
};

/**
 * Get reminder by wablas schedule ID
 */
export const getReminderByWablasId = async (wablas_schedule_id) => {
  const { data, error } = await supabase
    .from("kontrol_wa_reminders")
    .select("*")
    .contains("wablas_schedule_ids", [wablas_schedule_id])
    .eq("is_active", true)
    .single();

  if (error) {
    throw new Error("Failed to get reminder by wablas ID: " + error.message);
  }

  return data;
};
