import { loginAkun } from "../services/signinService.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const LoginWithPaddword = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email dan password harus diisi",
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
    const { dataLogin } = await loginAkun(email, password);

    res.status(200).json({
      success: true,
      message: "Login berhasil",
      access_token: dataLogin.session.access_token,
    });
  } catch (error) {
    console.error("Login error:", error.message);

    // Handle specific Supabase authentication errors
    if (error.message.includes("Invalid login credentials")) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah. Periksa kembali data Anda.",
        error_type: "invalid_credentials",
      });
    }

    if (error.message.includes("Email not confirmed")) {
      return res.status(401).json({
        success: false,
        message: "Email belum diverifikasi. Silakan cek inbox email Anda.",
        error_type: "email_not_confirmed",
      });
    }

    if (error.message.includes("Too many requests")) {
      return res.status(429).json({
        success: false,
        message:
          "Terlalu banyak percobaan login. Coba lagi dalam beberapa menit.",
        error_type: "too_many_requests",
      });
    }

    if (error.message.includes("User not found")) {
      return res.status(401).json({
        success: false,
        message: "Akun dengan email tersebut tidak ditemukan.",
        error_type: "user_not_found",
      });
    }

    // Generic authentication error
    return res.status(401).json({
      success: false,
      message: "Login gagal. Periksa kembali email dan password Anda.",
      error_type: "authentication_failed",
    });
  }
});
