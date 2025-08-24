import axios from "axios";

// Wablas Configuration (reuse dari existing wablasService)
const WABLAS_BASE_URL = "https://sby.wablas.com/api";
const WABLAS_TOKEN = process.env.WABLAS_TOKEN || "";
const WABLAS_SECRET_KEY = process.env.WABLAS_SECRET_KEY || "";

/**
 * Create scheduled WhatsApp message for control appointment reminder
 * Based on PHP example provided by user
 */
export const createWablasSchedule = async (scheduleData) => {
  try {
    const {
      phone,
      date,
      time,
      timezone = "Asia/Jakarta",
      message,
      isGroup = "false",
    } = scheduleData;

    const data = {
      phone: phone, // Format: 6281218xxxxxx
      date: date, // Format: 2022-05-20
      time: time, // Format: 13:20:00
      timezone: timezone, // Asia/Jakarta
      message: message, // Text message
      isGroup: isGroup, // 'true' or 'false' as string
    };

    console.log("Creating Wablas schedule with data:", data);

    const response = await axios.post(`${WABLAS_BASE_URL}/schedule`, data, {
      headers: {
        Authorization: `${WABLAS_TOKEN}.${WABLAS_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      transformRequest: [
        (data) => {
          return Object.keys(data)
            .map(
              (key) =>
                `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`
            )
            .join("&");
        },
      ],
    });

    console.log("Wablas schedule response:", response.data);

    if (response.data.status) {
      return {
        success: true,
        data: response.data,
        schedule_id: response.data.messages?.[0]?.id || null,
      };
    } else {
      throw new Error(
        response.data.message || "Failed to create Wablas schedule"
      );
    }
  } catch (error) {
    console.error(
      "Wablas Schedule API Error:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create Wablas schedule"
    );
  }
};

/**
 * Delete WhatsApp scheduled message by schedule ID
 * Used when control is deleted or marked as completed
 */
export const deleteWablasSchedule = async (scheduleId) => {
  try {
    console.log(`Attempting to delete Wablas schedule: ${scheduleId}`);

    // Delete the schedule directly
    const deleteResponse = await axios.delete(
      `${WABLAS_BASE_URL}/schedule/${scheduleId}`,
      {
        headers: {
          Authorization: `${WABLAS_TOKEN}.${WABLAS_SECRET_KEY}`,
        },
      }
    );

    console.log(
      `✅ Successfully deleted schedule ${scheduleId}:`,
      deleteResponse.data
    );

    return {
      success: true,
      message: "Schedule deleted successfully",
      data: deleteResponse.data,
    };
  } catch (error) {
    console.error(
      `⚠️ Failed to delete schedule ${scheduleId}:`,
      error.response?.data || error.message
    );

    // Even if delete fails, we still return success for database cleanup
    return {
      success: false,
      message: `Could not delete schedule ${scheduleId}: ${
        error.response?.data?.message || error.message
      }`,
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Delete multiple WhatsApp schedules
 */
export const deleteMultipleWablasSchedules = async (scheduleIds) => {
  const results = [];

  for (const scheduleId of scheduleIds) {
    try {
      const result = await deleteWablasSchedule(scheduleId);
      results.push({ scheduleId, ...result });
    } catch (error) {
      results.push({
        scheduleId,
        success: false,
        message: error.message,
      });
    }
  }

  return results;
};

/**
 * Generate reminder message for control appointment with timing info
 */
export const generateControlReminderMessageWithTiming = (
  controlData,
  reminderType
) => {
  const { dokter, tanggal, waktu, nama_pasien } = controlData;

  const timingText =
    reminderType === "1_day_before"
      ? "🗓️ *Besok Anda memiliki jadwal kontrol*"
      : "⏰ *Segera! Kontrol dokter dalam 4 jam*";

  return `🩺 *Pengingat Kontrol Dokter*

${timingText}

📅 Tanggal: ${tanggal}
⏰ Waktu: ${waktu}
👨‍⚕️ Dokter: ${dokter}
👤 Pasien: ${nama_pasien}

Jangan lupa untuk datang tepat waktu ya! 😊

_Pesan otomatis dari NGOMPAS_`;
};

/**
 * Generate reminder message for control appointment
 */
export const generateControlReminderMessage = (controlData) => {
  const { dokter, tanggal, waktu, nama_pasien } = controlData;

  return `🩺 *Pengingat Kontrol Dokter*

📅 Tanggal: ${tanggal}
⏰ Waktu: ${waktu}
👨‍⚕️ Dokter: ${dokter}
👤 Pasien: ${nama_pasien}

Jangan lupa untuk datang tepat waktu ya! 😊

_Pesan otomatis dari NGOMAPS_`;
};

/**
 * Format phone number for Wablas API (reuse from existing)
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return null;

  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, "");

  // Convert Indonesian format to international
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1);
  } else if (cleaned.startsWith("8")) {
    cleaned = "62" + cleaned;
  } else if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }

  return cleaned;
};

/**
 * Calculate multiple reminder times for control appointment
 * Returns array of 2 reminders: 1 day before and 4 hours before
 */
export const calculateControlReminderTimes = (controlDate, controlTime) => {
  // Validate parameters
  if (!controlDate || !controlTime) {
    throw new Error(
      `Invalid parameters: controlDate=${controlDate}, controlTime=${controlTime}`
    );
  }

  if (typeof controlDate !== "string" || typeof controlTime !== "string") {
    throw new Error(
      `Parameters must be strings: controlDate=${typeof controlDate}, controlTime=${typeof controlTime}`
    );
  }

  // Parse control date and time
  const [year, month, day] = controlDate.split("-").map(Number);
  const [hours, minutes] = controlTime.split(":").map(Number);
  const controlDateTime = new Date(year, month - 1, day, hours, minutes);

  // 1. First reminder: 1 day before at the same time
  const oneDayBefore = new Date(controlDateTime);
  oneDayBefore.setDate(oneDayBefore.getDate() - 1);

  const oneDayBeforeDate = oneDayBefore.toISOString().split("T")[0]; // YYYY-MM-DD
  const oneDayBeforeTime = `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}:00`;

  // 2. Second reminder: 4 hours before the actual appointment
  const fourHoursBefore = new Date(controlDateTime);
  fourHoursBefore.setHours(fourHoursBefore.getHours() - 4);

  const fourHoursBeforeDate = fourHoursBefore.toISOString().split("T")[0]; // YYYY-MM-DD
  const fourHoursBeforeTime = `${String(fourHoursBefore.getHours()).padStart(
    2,
    "0"
  )}:${String(fourHoursBefore.getMinutes()).padStart(2, "0")}:00`;

  return [
    {
      type: "1_day_before",
      date: oneDayBeforeDate,
      time: oneDayBeforeTime,
      description: "1 hari sebelumnya",
    },
    {
      type: "4_hours_before",
      date: fourHoursBeforeDate,
      time: fourHoursBeforeTime,
      description: "4 jam sebelumnya",
    },
  ];
};

/**
 * Calculate reminder date/time based on control date and preferred reminder time
 * Default: 1 day before at 09:00
 */
export const calculateReminderDateTime = (
  controlDate,
  controlTime,
  reminderHoursBefore = 24
) => {
  // Parse control date (YYYY-MM-DD format)
  const [year, month, day] = controlDate.split("-").map(Number);
  const controlDateTime = new Date(year, month - 1, day);

  // Calculate reminder date
  const reminderDateTime = new Date(controlDateTime);
  reminderDateTime.setHours(reminderDateTime.getHours() - reminderHoursBefore);

  // Set reminder time (default 09:00)
  reminderDateTime.setHours(9, 0, 0, 0);

  // Format for Wablas API
  const reminderDate = reminderDateTime.toISOString().split("T")[0]; // YYYY-MM-DD
  const reminderTime = "09:00:00"; // Fixed reminder time

  return {
    date: reminderDate,
    time: reminderTime,
  };
};
