import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const WABLAS_BASE_URL = "https://sby.wablas.com/api";
const WABLAS_TOKEN = process.env.WABLAS_TOKEN || "";
const WABLAS_SECRET_KEY = process.env.WABLAS_SECRET_KEY || "";
const DRY_RUN_GLOBAL = (process.env.WABLAS_DRY_RUN || "0") === "1";

// Simple in-memory store for dry-run message statuses
const dryStore = new Map(); // id -> { phone, message, createdAt }
function createDryMessage(phone, message, type) {
  const id = `dry_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  dryStore.set(id, {
    phone,
    message,
    type,
    createdAt: Date.now(),
  });
  return id;
}
function getDryStatus(messageId) {
  const rec = dryStore.get(messageId);
  if (!rec) return { success: false, error: "dry-run message not found" };
  const elapsed = (Date.now() - rec.createdAt) / 1000;
  let status = "queued";
  if (elapsed >= 0.5) status = "sent";
  if (elapsed >= 2) status = "delivered";
  if (elapsed >= 5) status = "read";
  return { success: true, status, response: { data: { status } } };
}

export const sendWhatsAppMessage = async (
  phone,
  message,
  type = "text",
  options = {}
) => {
  try {
    const dryRun = options?.dryRun || DRY_RUN_GLOBAL;
    if (dryRun) {
      const id = createDryMessage(phone, message, type);
      return {
        success: true,
        messageId: id,
        response: { data: { id, dryRun: true } },
        phone,
        sentAt: new Date().toISOString(),
      };
    }
    // Format auth token
    const authToken = `${WABLAS_TOKEN}.${WABLAS_SECRET_KEY}`;

    let endpoint, payload;

    switch (type) {
      case "text":
        endpoint = `${WABLAS_BASE_URL}/send-message`;
        payload = {
          phone: phone,
          message: message,
        };
        break;

      case "image":
        endpoint = `${WABLAS_BASE_URL}/send-image`;
        payload = {
          phone: phone,
          image: message, // URL gambar
          caption: payload.caption || "",
        };
        break;

      case "document":
        endpoint = `${WABLAS_BASE_URL}/send-document`;
        payload = {
          phone: phone,
          document: message, // URL dokumen
          filename: payload.filename || "document.pdf",
        };
        break;

      default:
        endpoint = `${WABLAS_BASE_URL}/send-message`;
        payload = {
          phone: phone,
          message: message,
        };
    }

    const response = await axios.post(endpoint, payload, {
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json",
      },
    });

    return {
      success: true,
      messageId: response.data.data?.id || response.data.id,
      response: response.data,
      phone: phone,
      sentAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(
      `❌ Failed to send WhatsApp message:`,
      error.response?.data || error.message
    );

    return {
      success: false,
      error: error.response?.data?.message || error.message,
      phone: phone,
      failedAt: new Date().toISOString(),
    };
  }
};

export const sendScheduledMessage = async (phone, message, scheduleDate) => {
  try {
    const authToken = `${WABLAS_TOKEN}.${WABLAS_SECRET_KEY}`;

    const payload = {
      phone: phone,
      message: message,
      schedule: scheduleDate, // Format: YYYY-MM-DD HH:mm:ss
    };

    const response = await axios.post(
      `${WABLAS_BASE_URL}/send-schedule`,
      payload,
      {
        headers: {
          Authorization: authToken,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      scheduleId: response.data.data?.id || response.data.id,
      response: response.data,
      phone: phone,
      scheduledFor: scheduleDate,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error(
      `❌ Failed to schedule WhatsApp message:`,
      error.response?.data || error.message
    );

    return {
      success: false,
      error: error.response?.data?.message || error.message,
      phone: phone,
      failedAt: new Date().toISOString(),
    };
  }
};

export const getMessageStatus = async (messageId, options = {}) => {
  try {
    const dryRun = options?.dryRun || DRY_RUN_GLOBAL;
    if (dryRun || messageId?.startsWith("dry_")) {
      return getDryStatus(messageId);
    }
    const authToken = `${WABLAS_TOKEN}.${WABLAS_SECRET_KEY}`;

    const response = await axios.get(
      `${WABLAS_BASE_URL}/message-status/${messageId}`,
      {
        headers: {
          Authorization: authToken,
        },
      }
    );

    return {
      success: true,
      status: response.data.data?.status || response.data.status,
      response: response.data,
    };
  } catch (error) {
    console.error(
      `❌ Failed to get message status:`,
      error.response?.data || error.message
    );

    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};
