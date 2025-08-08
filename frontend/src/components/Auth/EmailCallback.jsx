import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { toast } from "react-toastify";
import { logo } from "../../assets";

const EmailCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("Memverifikasi email Anda...");

  useEffect(() => {
    handleEmailConfirmation();
  }, []);

  const handleEmailConfirmation = async () => {
    try {
      // Get access token from URL
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      console.log("🔐 Processing email verification...", {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
      });

      if (!accessToken) {
        throw new Error("Token verifikasi tidak ditemukan");
      }

      // Set session dengan token
      const {
        data: { user },
        error: sessionError,
      } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      if (sessionError) throw sessionError;

      if (user) {
        console.log("✅ User authenticated:", user.id);

        // Cek apakah profile sudah ada
        const { data: existingProfile, error: profileCheckError } =
          await supabase
            .from("profile")
            .select("*")
            .eq("user_id", user.id)
            .single();

        if (profileCheckError && profileCheckError.code !== "PGRST116") {
          // PGRST116 = no rows found, yang normal untuk user baru
          throw profileCheckError;
        }

        // Jika profile belum ada, buat dari metadata yang disimpan saat signup
        if (!existingProfile && user.user_metadata) {
          console.log(
            "📝 Creating profile from metadata...",
            user.user_metadata
          );

          const { error: profileError } = await supabase
            .from("profile")
            .insert([
              {
                user_id: user.id,
                email: user.email,
                username:
                  user.user_metadata.username || user.email.split("@")[0],
                no_hp: user.user_metadata.phone || "",
              },
            ]);

          if (profileError) {
            console.error("❌ Profile creation failed:", profileError);
            throw new Error("Gagal membuat profil pengguna");
          }

          console.log("✅ Profile created successfully");
        }

        setStatus("success");
        setMessage("Email berhasil diverifikasi! Mengarahkan ke dashboard...");

        toast.success("Email berhasil diverifikasi! Selamat datang!");

        setTimeout(() => {
          navigate("/dashboard");
        }, 3000);
      }
    } catch (error) {
      console.error("❌ Email verification failed:", error);
      setStatus("error");
      setMessage(
        error.message ||
          "Verifikasi email gagal. Link mungkin sudah kedaluwarsa."
      );
      toast.error("Verifikasi email gagal");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
        <img src={logo} alt="Logo" className="h-16 mx-auto mb-6" />

        {status === "verifying" && (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500 mx-auto"></div>
            <h2 className="text-xl font-semibold text-gray-800">
              Memverifikasi Email
            </h2>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-800">Berhasil!</h2>
            <p className="text-gray-600">{message}</p>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full animate-pulse"
                style={{ width: "100%" }}
              ></div>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-800">
              Gagal Verifikasi
            </h2>
            <p className="text-gray-600">{message}</p>
            <div className="space-y-2">
              <button
                onClick={() => navigate("/register")}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full transition-colors"
              >
                Kembali ke Register
              </button>
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-full transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailCallback;
