import { supabase } from "../config/supabaseClient.js";
import {
  createWablasSchedule,
  generateControlReminderMessage,
  generateControlReminderMessageWithTiming,
  formatPhoneNumber,
  calculateControlReminderTimes,
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

  console.log("Creating multiple schedule reminders:", reminderTimes);

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

        console.log(
          `✅ Created ${reminderTime.type} reminder:`,
          scheduleResponse.schedule_id,
          `scheduled for: ${reminderTime.date} ${reminderTime.time}`
        );
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

  console.log("Attempting to insert control data:", insertData);

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

        console.log(
          `✅ Created ${reminderResult.scheduleIds.length} WhatsApp reminders for control ${inserted.id}`
        );
      } catch (scheduleError) {
        console.error(
          "Failed to create WhatsApp schedule reminders:",
          scheduleError
        );
        console.log("Control created successfully without WhatsApp reminders");
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
  const { data, error } = await supabase
    .from("kontrol")
    .update({ isDone })
    .eq("id", id)
    .select();

  if (error) throw new Error("Error updating data");
  return data;
};

// update supabse
export const updateControl = async (id, updatedData) => {
  const { data, error } = await supabase
    .from("kontrol")
    .update(updatedData)
    .eq("id", id)
    .select();

  if (error) throw new Error("Failed to update control data");
  return data;
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
    // 1. Get and log WhatsApp schedule data from separate table
    const { data: reminders } = await supabase
      .from("kontrol_wa_reminders")
      .select("wablas_schedule_ids, reminder_types")
      .eq("kontrol_id", id);

    if (reminders && reminders.length > 0) {
      reminders.forEach((reminder) => {
        if (
          reminder.wablas_schedule_ids &&
          reminder.wablas_schedule_ids.length > 0
        ) {
          console.log(
            `Control has ${reminder.wablas_schedule_ids.length} WhatsApp schedule IDs:`,
            reminder.wablas_schedule_ids
          );
          console.log(
            "Note: Wablas doesn't provide cancel endpoint, schedules may continue to run"
          );

          // Log each schedule ID for potential manual cleanup
          reminder.wablas_schedule_ids.forEach((scheduleId, index) => {
            const type = reminder.reminder_types[index] || "unknown";
            console.log(`  ${index + 1}. ${type}: ${scheduleId}`);
          });
        }
      });
    }

    // 2. Delete control record (reminders will be deleted automatically via CASCADE)
    const { data, error } = await supabase
      .from("kontrol")
      .delete()
      .eq("id", id)
      .eq("user_id", user_id);

    if (error) throw new Error("Failed to delete control data");

    console.log(`✅ Control ${id} and its reminders deleted successfully`);
    return data;
  } catch (error) {
    console.error("Error deleting control:", error);
    throw error;
  }
};
