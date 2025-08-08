import { supabase } from "../config/supabaseClient.js";

export const sendPasswordResetEmail = async (email) => {
  try {
    // Cek apakah email ada di database profile untuk validasi internal
    const { data: profile, error: profileError } = await supabase
      .from("profile")
      .select("email")
      .eq("email", email)
      .single();

    // Jika profile error dan bukan karena tidak ditemukan, throw error
    if (profileError && profileError.code !== "PGRST116") {
      throw new Error("Gagal memeriksa email");
    }

    // Kirim email reset password menggunakan Supabase Auth
    // Ini akan mengirim email hanya jika user exists di auth.users
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Send password reset email error:", error);
    throw error;
  }
};
