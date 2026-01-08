import { asyncHandler } from "../middleware/errorHandler.js";
import { sendPasswordResetEmail } from "../services/forgotPasswordService.js";

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Validation input
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email harus diisi",
      error_type: "validation_error",
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Format email tidak valid",
      error_type: "invalid_email",
    });
  }

  try {
    await sendPasswordResetEmail(email);

    // Selalu return success message untuk keamanan
    // Jangan expose apakah email ada atau tidak di database
    res.status(200).json({
      success: true,
      message:
        "Jika email terdaftar, link reset password akan dikirim ke email Anda",
    });
  } catch (error) {
    console.error("Forgot password error:", error.message);

    // Handle specific errors from Supabase
    if (error.message.includes("Invalid email")) {
      return res.status(400).json({
        success: false,
        message: "Format email tidak valid",
        error_type: "invalid_email",
      });
    }

    if (error.message.includes("Too many requests")) {
      return res.status(429).json({
        success: false,
        message: "Terlalu banyak permintaan. Coba lagi dalam beberapa menit.",
        error_type: "too_many_requests",
      });
    }

    // Generic error response untuk keamanan
    return res.status(200).json({
      success: true,
      message:
        "Jika email terdaftar, link reset password akan dikirim ke email Anda",
    });
  }
});
