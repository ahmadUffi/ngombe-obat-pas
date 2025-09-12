import { sendWhatsAppMessage } from "../services/messageService.js";

// Fungsi validasi nomor telepon Indonesia (sederhana)
const validateIndonesianPhoneNumber = (phone) => {
  // Hapus semua karakter non-digit
  const cleanPhone = phone.replace(/\D/g, "");

  // Cek panjang minimum dan maksimum
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return {
      isValid: false,
      error: "Phone number must be between 10-15 digits",
      cleanPhone: null,
    };
  }

  let formattedPhone = cleanPhone;

  // Format nomor ke 62xxx
  if (cleanPhone.startsWith("0")) {
    // Format lokal, convert ke internasional
    formattedPhone = "62" + cleanPhone.substring(1);
  } else if (!cleanPhone.startsWith("62")) {
    // Format tanpa 0 dan 62, tambahkan 62
    formattedPhone = "62" + cleanPhone;
  }

  // Validasi format Indonesia (62 + 8 + 8-12 digits)
  const indonesianPattern = /^62[8][0-9]{8,12}$/;
  if (!indonesianPattern.test(formattedPhone)) {
    return {
      isValid: false,
      error:
        "Invalid Indonesian phone number format. Use format: +62xxx, 62xxx, 08xxx, or 8xxx",
      cleanPhone: null,
    };
  }

  return {
    isValid: true,
    error: null,
    cleanPhone: formattedPhone,
  };
};

export const sendMessage = async (req, res) => {
  try {
    const { phone, message, type = "text" } = req.body;

    // Validasi input
    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        message: "Phone number and message are required",
      });
    }

    // Validasi nomor telepon dengan fungsi yang lebih robust
    const phoneValidation = validateIndonesianPhoneNumber(phone);
    if (!phoneValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: phoneValidation.error,
        details: {
          provided: phone,
          reason: "Invalid phone number format",
        },
      });
    }

    const formattedPhone = phoneValidation.cleanPhone;

    const result = await sendWhatsAppMessage(formattedPhone, message, type);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: "Message sent successfully",
        data: {
          messageId: result.messageId,
          phone: formattedPhone,
          sentAt: new Date().toISOString(),
          type: type,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to send message",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("❌ Error in sendMessage controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const sendBulkMessage = async (req, res) => {
  try {
    const { recipients, message, type = "text" } = req.body;

    // Validasi input
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Recipients array is required and must not be empty",
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    if (recipients.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Maximum 100 recipients allowed per bulk send",
      });
    }

    const results = [];
    const errors = [];

    for (const recipient of recipients) {
      try {
        let phone = recipient.phone || recipient;
        let customMessage = recipient.message || message;

        // Validasi nomor telepon dengan fungsi yang robust
        const phoneValidation = validateIndonesianPhoneNumber(phone);
        if (!phoneValidation.isValid) {
          errors.push({
            phone: phone,
            error: phoneValidation.error,
            status: "invalid",
          });
          continue; // Skip ke recipient berikutnya
        }

        const formattedPhone = phoneValidation.cleanPhone;

        const result = await sendWhatsAppMessage(
          formattedPhone,
          customMessage,
          type
        );

        if (result.success) {
          results.push({
            phone: formattedPhone,
            originalPhone: phone,
            messageId: result.messageId,
            status: "sent",
          });
        } else {
          errors.push({
            phone: formattedPhone,
            originalPhone: phone,
            error: result.error,
            status: "failed",
          });
        }

        // Delay kecil antar pesan untuk avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        errors.push({
          phone: recipient.phone || recipient,
          error: error.message,
          status: "failed",
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk message completed. Sent: ${results.length}, Failed: ${errors.length}`,
      data: {
        sent: results,
        failed: errors,
        summary: {
          total: recipients.length,
          successful: results.length,
          failed: errors.length,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error in sendBulkMessage controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
