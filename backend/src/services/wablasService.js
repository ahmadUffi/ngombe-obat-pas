import axios from "axios";

// Wablas Configuration
const WABLAS_BASE_URL = "https://sby.wablas.com/api";
const WABLAS_TOKEN = process.env.WABLAS_TOKEN || "";
const WABLAS_SECRET_KEY = process.env.WABLAS_SECRET_KEY || "";

// Create Wablas Reminder
export const createWablasReminder = async (reminderData) => {
  try {
    const { phone, start_date, message, title } = reminderData;

    const data = {
      phone: phone,
      start_date: start_date, // Format: 2025-05-20 13:20:00
      message: message,
      periode: "daily", // daily reminder untuk obat
      title: title || "Reminder Minum Obat",
    };

    const response = await axios.post(`${WABLAS_BASE_URL}/reminder`, data, {
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

    if (response.data.status) {
      return {
        success: true,
        reminder_id: response.data.data.id,
        data: response.data.data,
      };
    } else {
      throw new Error(
        response.data.message || "Failed to create Wablas reminder"
      );
    }
  } catch (error) {
    console.error("Wablas API Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create Wablas reminder"
    );
  }
};

// Delete Wablas Reminder
export const deleteWablasReminder = async (reminderId) => {
  try {
    console.log("Attempting to delete Wablas reminder:", reminderId);

    // Validate credentials first
    if (!WABLAS_TOKEN || !WABLAS_SECRET_KEY) {
      console.warn("Missing Wablas credentials, skipping delete");
      return {
        success: false,
        error: "Missing Wablas credentials",
      };
    }

    const response = await axios.delete(
      `${WABLAS_BASE_URL}/reminder/${reminderId}`,
      {
        headers: {
          Authorization: WABLAS_TOKEN, // Use token only, not token.secret
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: "", // Empty data as in PHP http_build_query($data) with empty $data
      }
    );

    console.log("Wablas delete response:", response.data);

    if (response.data.status) {
      console.log("✅ Wablas reminder deleted successfully:", reminderId);
      return {
        success: true,
        data: response.data,
      };
    } else {
      console.warn("⚠️ Wablas delete failed:", response.data.message);
      return {
        success: false,
        error: response.data.message || "Delete failed",
      };
    }
  } catch (error) {
    console.error(
      "❌ Wablas Delete Error:",
      error.response?.data || error.message
    );

    // Handle specific error cases
    if (error.response?.status === 404) {
      console.log(
        "📝 Reminder not found (404), considering as already deleted"
      );
      return {
        success: true,
        data: { message: "Reminder not found (already deleted)" },
      };
    }

    if (
      error.response?.status === 401 ||
      error.response?.data?.message?.includes("token")
    ) {
      console.warn("🔐 Authentication issue with Wablas API");
      return {
        success: false,
        error: "Wablas authentication failed",
      };
    }

    // For other errors, don't fail the entire delete process
    console.warn("⚠️ Wablas delete failed, but continuing with jadwal delete");
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to delete Wablas reminder",
    };
  }
};

// Generate reminder message
export const generateReminderMessage = (jadwalData, jam) => {
  const { nama_obat, dosis_obat, nama_pasien } = jadwalData;

  return `🕐 *Pengingat Minum Obat*

⏰ Waktu: ${jam}
👤 Pasien: ${nama_pasien}
💊 Obat: ${nama_obat}
📏 Dosis: ${dosis_obat}

Jangan lupa minum obat sesuai jadwal ya! 😊

_Pesan otomatis dari SmedBox_`;
};

// Format start_date for Wablas
export const formatStartDate = (jam) => {
  const today = new Date();
  const [hours, minutes] = jam.split(":");

  // Set jam hari ini, jika sudah lewat maka besok
  const reminderDate = new Date(today);
  reminderDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

  // Jika jam sudah lewat hari ini, set untuk besok
  if (reminderDate <= today) {
    reminderDate.setDate(reminderDate.getDate() + 1);
  }

  // Format: YYYY-MM-DD HH:mm:ss (local time)
  const year = reminderDate.getFullYear();
  const month = String(reminderDate.getMonth() + 1).padStart(2, "0");
  const day = String(reminderDate.getDate()).padStart(2, "0");
  const hour = String(reminderDate.getHours()).padStart(2, "0");
  const minute = String(reminderDate.getMinutes()).padStart(2, "0");
  const second = String(reminderDate.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

// Format phone number for Wablas API
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
