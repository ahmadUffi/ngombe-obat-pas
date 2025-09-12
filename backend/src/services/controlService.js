import { supabase } from "../config/supabaseClient.js";
import {
  createWablasSchedule,
  generateControlReminderMessage,
  generateControlReminderMessageWithTiming,
  formatPhoneNumber,
  calculateControlReminderTimes,
  deleteMultipleWablasSchedules,
} from "./wablasScheduleService.js";

// Create control reminders in separate table
const createControlReminders = async (
  kontrol_id,
  user_id,
  controlData,
  phone
) => {
  const reminderTimes = calculateControlReminderTimes(
    controlData.tanggal,
    controlData.waktu
  );

  const scheduleIds = [];
  const reminderTypes = [];
  const reminderTimeStrings = [];

  // Create schedule for each reminder time
  for (const reminderTime of reminderTimes) {
    try {
      // Generate specific message for this reminder type
      const message = generateControlReminderMessageWithTiming(
        controlData,
        reminderTime
      );

      // Create Wablas schedule
      const scheduleResponse = await createWablasSchedule({
        phone,
        message,
        date: reminderTime.date,
        time: reminderTime.time,
      });

      if (scheduleResponse?.schedule_id) {
        scheduleIds.push(scheduleResponse.schedule_id);
        reminderTypes.push(reminderTime.type);
        reminderTimeStrings.push(`${reminderTime.date} ${reminderTime.time}`);
      }
    } catch (error) {
      console.error(`Failed to create ${reminderTime.type} reminder:`, error);
    }
  }

  // Insert reminder data to separate table
  if (scheduleIds.length > 0) {
    const { error: reminderError } = await supabase
      .from("kontrol_wa_reminders")
      .insert([
        {
          kontrol_id,
          user_id,
          reminder_types: reminderTypes,
          reminder_times: reminderTimeStrings,
          wablas_schedule_ids: scheduleIds,
        },
      ]);

    if (reminderError) {
      console.error("Failed to save reminder data:", reminderError);
      throw new Error("Failed to save reminder data");
    }
  }

  return { scheduleIds, reminderTypes, reminderTimeStrings };
};

export const createControl = async (user_id, data) => {
  // Get user profile with phone number
  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("id, no_hp, username")
    .eq("user_id", user_id)
    .single();

  if (profileError || !profile) throw new Error("Profile not found");
  if (!profile.no_hp) {
    throw new Error(
      "Nomor HP tidak ditemukan. Mohon lengkapi profile terlebih dahulu."
    );
  }

  // Format phone number for Wablas
  const formattedPhone = formatPhoneNumber(profile.no_hp);
  if (!formattedPhone) {
    throw new Error("Format nomor HP tidak valid");
  }

  const insertData = {
    user_id,
    profile_id: profile.id,
    tanggal: data.tanggal,
    waktu: data.waktu,
    dokter: data.dokter,
    nama_pasien: data.nama_pasien,
  };

  try {
    // 1. Insert control to database first
    const { data: inserted, error: insertError } = await supabase
      .from("kontrol")
      .insert([insertData])
      .select()
      .single();

    if (insertError) {
      console.error("Insert error details:", insertError);
      throw new Error("Failed to insert kontrol data: " + insertError.message);
    }

    // 2. Create WhatsApp schedule reminders in separate table (if enabled)
    if (data.enableReminder !== false) {
      // Default to true unless explicitly disabled
      try {
        const reminderResult = await createControlReminders(
          inserted.id,
          user_id,
          {
            tanggal: data.tanggal,
            waktu: data.waktu,
            dokter: data.dokter,
            nama_pasien: data.nama_pasien,
          },
          formattedPhone
        );
      } catch (scheduleError) {
        console.error(
          "Failed to create WhatsApp schedule reminders:",
          scheduleError
        );
      }
    }

    return inserted;
  } catch (error) {
    console.error("Error creating control:", error);
    throw new Error("Gagal membuat control: " + error.message);
  }
};

export const getControl = async (user_id) => {
  // Get controls with reminder data
  const { data: controls, error } = await supabase
    .from("kontrol")
    .select(
      `
      *,
      kontrol_wa_reminders (
        id,
        reminder_types,
        reminder_times,
        wablas_schedule_ids,
        is_active
      )
    `
    )
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Error fetching data");
  return controls;
};

// update isDone at table control kolom isDOne
export const updateIsDone = async (id, isDone) => {
  try {
    // If marking as done (completed), delete any pending WhatsApp schedules
    if (isDone === true) {
      // Get reminder data first
      const { data: reminders } = await supabase
        .from("kontrol_wa_reminders")
        .select("wablas_schedule_ids, reminder_types")
        .eq("kontrol_id", id)
        .eq("is_active", true);

      if (reminders && reminders.length > 0) {
        for (const reminder of reminders) {
          if (
            reminder.wablas_schedule_ids &&
            reminder.wablas_schedule_ids.length > 0
          ) {
            // Delete Wablas schedules
            const deleteResults = await deleteMultipleWablasSchedules(
              reminder.wablas_schedule_ids
            );

            // Deactivate reminder record regardless of Wablas delete success
            await supabase
              .from("kontrol_wa_reminders")
              .update({ is_active: false })
              .eq("kontrol_id", id);
          }
        }
      }
    }

    // Update the control record
    const { data, error } = await supabase
      .from("kontrol")
      .update({ isDone, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select();

    if (error) throw new Error("Error updating control data: " + error.message);

    return data;
  } catch (error) {
    console.error("Error updating control isDone:", error);
    throw error;
  }
};

// update control in supabase and also in wablas if needed
export const updateControl = async (id, updatedData) => {
  try {
    // First, get the current control data with user ID and profile
    const { data: controlData, error: controlError } = await supabase
      .from("kontrol")
      .select(`*, profile:profile_id(no_hp)`)
      .eq("id", id)
      .single();

    if (controlError || !controlData) {
      throw new Error("Failed to fetch control data for update");
    }

    // Get existing reminder data
    const { data: reminders } = await supabase
      .from("kontrol_wa_reminders")
      .select("id, wablas_schedule_ids, reminder_types, is_active")
      .eq("kontrol_id", id)
      .eq("is_active", true);

    // If there are active reminders, we need to update the Wablas schedules too
    if (reminders && reminders.length > 0 && controlData.profile?.no_hp) {
      // 1. Delete existing Wablas schedules
      for (const reminder of reminders) {
        if (
          reminder.wablas_schedule_ids &&
          reminder.wablas_schedule_ids.length > 0
        ) {
          await deleteMultipleWablasSchedules(reminder.wablas_schedule_ids);

          // Mark reminders as inactive
          await supabase
            .from("kontrol_wa_reminders")
            .update({ is_active: false })
            .eq("id", reminder.id);
        }
      }

      // 2. Create new Wablas schedules with updated data
      const phone = formatPhoneNumber(controlData.profile.no_hp);
      if (phone) {
        // Create new reminders with updated data
        await createControlReminders(
          id,
          controlData.user_id,
          {
            tanggal: updatedData.tanggal || controlData.tanggal,
            waktu: updatedData.waktu || controlData.waktu,
            dokter: updatedData.dokter || controlData.dokter,
            nama_pasien: updatedData.nama_pasien || controlData.nama_pasien,
          },
          phone
        );
      }
    }

    // Finally, update the control record in database
    const { data, error } = await supabase
      .from("kontrol")
      .update(updatedData)
      .eq("id", id)
      .select();

    if (error) throw new Error("Failed to update control data");
    return data;
  } catch (error) {
    console.error("Error updating control with Wablas integration:", error);
    throw error;
  }
};

// Delete control by ID with WhatsApp schedule cleanup
export const deleteControl = async (id, user_id) => {
  // First check if the control belongs to the user
  const { data: control, error: errorCheck } = await supabase
    .from("kontrol")
    .select("*")
    .eq("id", id)
    .eq("user_id", user_id)
    .single();

  if (errorCheck || !control) {
    throw new Error("Kontrol tidak ditemukan atau Anda tidak memiliki akses");
  }

  try {
    // 1. Get WhatsApp schedule data from separate table and try to delete
    const { data: reminders } = await supabase
      .from("kontrol_wa_reminders")
      .select("wablas_schedule_ids, reminder_types")
      .eq("kontrol_id", id)
      .eq("is_active", true);

    if (reminders && reminders.length > 0) {
      for (const reminder of reminders) {
        if (
          reminder.wablas_schedule_ids &&
          reminder.wablas_schedule_ids.length > 0
        ) {
          // Delete Wablas schedules
          const deleteResults = await deleteMultipleWablasSchedules(
            reminder.wablas_schedule_ids
          );
        }
      }
    }

    // 2. Delete control record (reminders will be deleted automatically via CASCADE)
    const { data, error } = await supabase
      .from("kontrol")
      .delete()
      .eq("id", id)
      .eq("user_id", user_id);

    if (error) throw new Error("Failed to delete control data");

    return data;
  } catch (error) {
    console.error("Error deleting control:", error);
    throw error;
  }
};

/**
 * Recreate WhatsApp schedules for all ACTIVE controls of the user with the new phone
 * - Delete existing Wablas schedules for these controls
 * - Create new schedules targeting the new phone
 */
export const recreateActiveControlSchedulesForUser = async (
  user_id,
  newPhone
) => {
  const phone = formatPhoneNumber(newPhone);
  if (!phone) throw new Error("Format nomor HP tidak valid");

  // 1) Fetch active controls (not done)
  const { data: controls, error } = await supabase
    .from("kontrol")
    .select("id, tanggal, waktu, dokter, nama_pasien")
    .eq("user_id", user_id)
    .eq("isDone", false);

  if (error) throw new Error("Gagal mengambil data kontrol: " + error.message);

  let totalDeleted = 0;
  let totalCreated = 0;

  for (const kontrol of controls || []) {
    try {
      // 2) Get previous reminder records for this control
      const { data: reminders } = await supabase
        .from("kontrol_wa_reminders")
        .select("id, wablas_schedule_ids")
        .eq("kontrol_id", kontrol.id)
        .eq("is_active", true);

      // 3) Delete Wablas schedules and deactivate DB records
      for (const reminder of reminders || []) {
        if (Array.isArray(reminder.wablas_schedule_ids)) {
          const results = await deleteMultipleWablasSchedules(
            reminder.wablas_schedule_ids
          );
          results.forEach((r) => {
            if (r.success) totalDeleted += 1;
          });
        }
      }

      if ((reminders || []).length > 0) {
        await supabase
          .from("kontrol_wa_reminders")
          .update({ is_active: false })
          .eq("kontrol_id", kontrol.id);
      }

      // 4) Recreate fresh schedules for this control using helper
      const { scheduleIds } = await createControlReminders(
        kontrol.id,
        user_id,
        {
          tanggal: kontrol.tanggal,
          waktu: kontrol.waktu,
          dokter: kontrol.dokter,
          nama_pasien: kontrol.nama_pasien,
        },
        phone
      );
      totalCreated += scheduleIds.length;
    } catch (err) {
      console.error(
        "Gagal recreate WA schedules untuk kontrol:",
        kontrol?.id,
        err?.message
      );
      // continue with next control
    }
  }

  return { totalDeleted, totalCreated, totalKontrol: controls?.length || 0 };
};

/**
 * Get kontrol details by ID
 * @param {string} kontrol_id - Kontrol ID
 * @returns {Object|null} Kontrol details or null if not found
 */
export const getKontrolById = async (kontrol_id) => {
  try {
    const { data, error } = await supabase
      .from("kontrol")
      .select(
        `
        *,
        profile:user_id (
          username,
          no_hp
        )
      `
      )
      .eq("id", kontrol_id)
      .single();

    if (error) {
      console.error("Error fetching kontrol details:", error.message);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getKontrolById:", error);
    return null;
  }
};
