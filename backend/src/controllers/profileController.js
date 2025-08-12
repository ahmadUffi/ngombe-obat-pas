import { supabase } from "../config/supabaseClient.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import {
  createWablasSchedule,
  generateControlReminderMessageWithTiming,
  calculateControlReminderTimes,
  deleteMultipleWablasSchedules,
} from "../services/wablasScheduleService.js";
import {
  createWablasReminder,
  deleteWablasReminder,
  generateReminderMessage,
  formatStartDate,
} from "../services/wablasService.js";

/**
 * Update all active medication reminders for a user when their phone number changes
 * @param {string} userId - The user ID
 * @param {string} newPhone - The formatted new phone number
 */
async function updateUserMedicationReminders(userId, newPhone) {
  try {
    console.log(
      `Updating medication reminders for user ${userId} with new phone: ${newPhone}`
    );

    // Step 1: Get all active medication reminders for this user
    const { data: jadwalReminders, error: jadwalError } = await supabase
      .from("wa_reminders")
      .select(
        `
        id, 
        jadwal_id, 
        wablas_reminder_ids,
        jam_reminders,
        jadwal:jadwal_id (
          id,
          nama_pasien,
          nama_obat,
          dosis_obat,
          kategori,
          catatan
        )
      `
      )
      .eq("user_id", userId);

    if (jadwalError) {
      console.error("Error fetching medication reminders:", jadwalError);
      return;
    }

    console.log(
      `Found ${jadwalReminders?.length || 0} medication reminder sets to update`
    );

    // Step 2: Process each reminder set
    for (const reminder of jadwalReminders || []) {
      if (
        reminder.wablas_reminder_ids &&
        Array.isArray(reminder.wablas_reminder_ids) &&
        reminder.jam_reminders &&
        Array.isArray(reminder.jam_reminders) &&
        reminder.jadwal
      ) {
        try {
          // Step 2.1: Delete existing Wablas reminders
          console.log(
            `Deleting ${reminder.wablas_reminder_ids.length} Wablas reminders for medication ${reminder.jadwal_id}`
          );

          for (const reminderId of reminder.wablas_reminder_ids) {
            try {
              await deleteWablasReminder(reminderId);
              console.log(`✅ Deleted medication reminder: ${reminderId}`);
            } catch (deleteError) {
              console.error(
                `Error deleting medication reminder ${reminderId}:`,
                deleteError
              );
            }
          }

          // Step 2.2: Create new reminders with updated phone number
          const newReminderIds = [];

          for (const jam of reminder.jam_reminders) {
            try {
              // Generate reminder message
              const message = generateReminderMessage(reminder.jadwal, jam);
              const startDate = formatStartDate(jam);

              // Create new Wablas reminder with updated phone number
              const wablasResponse = await createWablasReminder({
                phone: newPhone,
                start_date: startDate,
                message: message,
                title: `Reminder ${reminder.jadwal.nama_obat} - ${jam}`,
              });

              if (wablasResponse?.reminder_id) {
                newReminderIds.push(wablasResponse.reminder_id);
                console.log(
                  `✅ Created new medication reminder for ${jam}:`,
                  wablasResponse.reminder_id
                );
              }
            } catch (reminderError) {
              console.error(
                `Failed to create medication reminder for ${jam}:`,
                reminderError
              );
            }
          }

          // Step 2.3: Update the reminder record with new reminder IDs
          if (newReminderIds.length > 0) {
            const { error: updateError } = await supabase
              .from("wa_reminders")
              .update({
                wablas_reminder_ids: newReminderIds,
                updated_at: new Date().toISOString(),
              })
              .eq("id", reminder.id);

            if (updateError) {
              console.error(
                `Error updating medication reminder record ${reminder.id}:`,
                updateError
              );
            } else {
              console.log(
                `✅ Updated medication reminder record ${reminder.id} with ${newReminderIds.length} new reminder IDs`
              );
            }
          }
        } catch (error) {
          console.error(
            `Error processing medication reminder ${reminder.id}:`,
            error
          );
        }
      }
    }

    console.log(
      `✅ Completed updating medication reminders for user ${userId}`
    );
  } catch (error) {
    console.error("Error updating medication reminders:", error);
  }
}

/**
 * Update all active Wablas schedules for a user when their phone number changes
 * @param {string} userId - The user ID
 * @param {string} newPhone - The formatted new phone number
 */
async function updateUserWablasSchedules(userId, newPhone) {
  try {
    console.log(
      `Updating Wablas schedules for user ${userId} with new phone: ${newPhone}`
    );

    // Step 1: Get all active control reminders for this user
    const { data: activeReminders, error: reminderError } = await supabase
      .from("kontrol_wa_reminders")
      .select(
        `
        id, 
        kontrol_id, 
        wablas_schedule_ids, 
        reminder_types, 
        reminder_times,
        kontrol:kontrol_id (
          id,
          tanggal,
          waktu,
          dokter,
          nama_pasien
        )
      `
      )
      .eq("user_id", userId)
      .eq("is_active", true);

    if (reminderError) {
      console.error("Error fetching active reminders:", reminderError);
      return;
    }

    console.log(
      `Found ${activeReminders?.length || 0} active reminders to update`
    );

    // Step 2: Process each active reminder
    for (const reminder of activeReminders || []) {
      if (
        reminder.wablas_schedule_ids &&
        reminder.wablas_schedule_ids.length > 0 &&
        reminder.kontrol
      ) {
        try {
          // Step 2.1: Delete existing Wablas schedules
          console.log(
            `Deleting ${reminder.wablas_schedule_ids.length} Wablas schedules for kontrol ${reminder.kontrol_id}`
          );
          await deleteMultipleWablasSchedules(reminder.wablas_schedule_ids);

          // Step 2.2: Create new schedules with the new phone number
          console.log(
            `Creating new schedules for kontrol ${reminder.kontrol_id} with new phone number`
          );

          const controlData = {
            tanggal: reminder.kontrol.tanggal,
            waktu: reminder.kontrol.waktu,
            dokter: reminder.kontrol.dokter,
            nama_pasien: reminder.kontrol.nama_pasien,
          };

          const reminderTimes = calculateControlReminderTimes(
            controlData.tanggal,
            controlData.waktu
          );

          const newScheduleIds = [];
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

              // Create new Wablas schedule with updated phone number
              const scheduleResponse = await createWablasSchedule({
                phone: newPhone,
                message,
                date: reminderTime.date,
                time: reminderTime.time,
              });

              if (scheduleResponse?.schedule_id) {
                newScheduleIds.push(scheduleResponse.schedule_id);
                reminderTypes.push(reminderTime.type);
                reminderTimeStrings.push(
                  `${reminderTime.date} ${reminderTime.time}`
                );

                console.log(
                  `✅ Created new ${reminderTime.type} reminder:`,
                  scheduleResponse.schedule_id,
                  `scheduled for: ${reminderTime.date} ${reminderTime.time}`
                );
              }
            } catch (error) {
              console.error(
                `Failed to create ${reminderTime.type} reminder:`,
                error
              );
            }
          }

          // Step 2.3: Update the reminder record with new schedule IDs
          if (newScheduleIds.length > 0) {
            await supabase
              .from("kontrol_wa_reminders")
              .update({
                wablas_schedule_ids: newScheduleIds,
                reminder_types: reminderTypes,
                reminder_times: reminderTimeStrings,
                updated_at: new Date().toISOString(),
              })
              .eq("id", reminder.id);

            console.log(
              `✅ Updated reminder record ${reminder.id} with ${newScheduleIds.length} new schedule IDs`
            );
          } else {
            // If no new schedules were created, mark the reminder as inactive
            await supabase
              .from("kontrol_wa_reminders")
              .update({ is_active: false })
              .eq("id", reminder.id);

            console.log(
              `⚠️ Marked reminder ${reminder.id} as inactive due to failed schedule creation`
            );
          }
        } catch (error) {
          console.error(
            `Error updating schedules for reminder ${reminder.id}:`,
            error
          );
        }
      }
    }

    console.log(`✅ Completed updating Wablas schedules for user ${userId}`);
  } catch (error) {
    console.error("Error in updateUserWablasSchedules:", error);
  }
}

/**
 * Update user's profile (username and phone)
 */
export const updateProfile = asyncHandler(async (req, res) => {
  console.log("updateProfile called with request:", req.body);

  const { username, no_hp } = req.body;
  const userId = req.user.id; // Mengambil userId dari req.user yang disediakan oleh middleware verifySupabaseUser  // Validate username
  if (!username || !username.trim()) {
    return res.status(400).json({
      success: false,
      message: "Username harus diisi",
    });
  }

  if (username.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: "Username minimal 3 karakter",
    });
  }

  // Validate phone number if provided
  if (no_hp && !validatePhoneNumber(no_hp)) {
    return res.status(400).json({
      success: false,
      message: "Format nomor HP tidak valid",
    });
  }

  try {
    // Get current profile to check if phone number is changing
    const { data: currentProfile, error: profileError } = await supabase
      .from("profile")
      .select("no_hp")
      .eq("user_id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching current profile:", profileError);
      throw new Error("Failed to fetch current profile");
    }

    // Prepare update data
    const updateData = {
      username: username.trim(),
    };

    // Format and add phone if provided
    let formattedPhone = null;
    if (no_hp) {
      formattedPhone = formatPhoneNumber(no_hp);
      updateData.no_hp = formattedPhone;
    }

    // Update the profile
    const { data, error } = await supabase
      .from("profile")
      .update(updateData)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      console.error("Profile update error:", error);

      if (error.message.includes("duplicate")) {
        return res.status(409).json({
          success: false,
          message: "Username sudah digunakan",
        });
      }

      throw error;
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Profile tidak ditemukan",
      });
    }

    // Check if phone number was changed and needs to be updated in Wablas schedules
    if (
      formattedPhone &&
      currentProfile &&
      formattedPhone !== currentProfile.no_hp
    ) {
      // Update all Wablas schedules and reminders for this user with the new phone number
      // We do this asynchronously so we don't block the response

      // Update control appointment schedules
      updateUserWablasSchedules(userId, formattedPhone)
        .then(() => {
          console.log(
            `Successfully updated control schedules for user ${userId}`
          );
        })
        .catch((error) => {
          console.error(
            `Failed to update control schedules for user ${userId}:`,
            error
          );
        });

      // Update medication reminders
      updateUserMedicationReminders(userId, formattedPhone)
        .then(() => {
          console.log(
            `Successfully updated medication reminders for user ${userId}`
          );
        })
        .catch((error) => {
          console.error(
            `Failed to update medication reminders for user ${userId}:`,
            error
          );
        });
    }

    // Return success
    return res.status(200).json({
      success: true,
      message: "Profile berhasil diperbarui",
      data: {
        id: data.id,
        user_id: data.user_id,
        username: data.username,
        no_hp: data.no_hp,
        updated_at: data.updated_at,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui profile",
    });
  }
});

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid, false if invalid
 */
function validatePhoneNumber(phone) {
  if (!phone) return false;

  // Remove spaces and dashes
  const cleanPhone = phone.replace(/[\s-]/g, "");

  // Match Indonesian phone number format
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
  return phoneRegex.test(cleanPhone);
}

/**
 * Format phone number to standard +62 format
 * @param {string} phone - Phone number to format
 * @returns {string} - Formatted phone number
 */
function formatPhoneNumber(phone) {
  if (!phone) return null;

  // Remove all non-digit characters except +
  const cleanPhone = phone.replace(/[^\d+]/g, "");

  // Normalize to Indonesian format starting with +62
  if (cleanPhone.startsWith("08")) {
    return "+62" + cleanPhone.substring(1);
  } else if (cleanPhone.startsWith("628")) {
    return "+" + cleanPhone;
  } else if (cleanPhone.startsWith("+62")) {
    return cleanPhone;
  }

  return cleanPhone;
}
