import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logo, maskot } from "../../assets";
import { AuthContext } from "../../hooks/useAuth";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { loginWithAPI } = useContext(AuthContext);

  // Clear errors when user starts typing
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: null }));
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors((prev) => ({ ...prev, password: null }));
    }
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email harus diisi";
      toast.error("Email harus diisi!");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Format email tidak valid";
      toast.error("Format email tidak valid!");
    }

    if (!password.trim()) {
      newErrors.password = "Password harus diisi";
      toast.error("Password harus diisi!");
    } else if (password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
      toast.error("Password minimal 6 karakter!");
    }

    setErrors(newErrors);

    // Show general validation error if any field is invalid
    if (Object.keys(newErrors).length > 0) {
      toast.error("Mohon periksa dan lengkapi form dengan benar!");
      return false;
    }

    return true;
  }; // Get user-friendly error message based on error type
  const getErrorMessage = (error) => {
    const errorMessage = error.message || "";
    const errorResponse = error.response?.data;

    if (errorResponse?.error_type) {
      switch (errorResponse.error_type) {
        case "invalid_credentials":
          return "Email atau password salah. Periksa kembali data Anda.";
        case "user_not_found":
          return "Akun dengan email tersebut tidak ditemukan. Silakan daftar terlebih dahulu.";
        case "email_not_confirmed":
          return "Email belum diverifikasi. Silakan cek inbox email Anda dan klik link verifikasi.";
        case "too_many_requests":
          return "Terlalu banyak percobaan login. Coba lagi dalam beberapa menit.";
        case "invalid_email":
          return "Format email tidak valid.";
        case "validation_error":
          return "Mohon lengkapi semua field yang diperlukan.";
        default:
          return (
            errorResponse.message ||
            "Login gagal. Periksa kembali email dan password Anda."
          );
      }
    }

    // Handle network and other errors
    if (
      errorMessage.includes("Network Error") ||
      errorMessage.includes("fetch")
    ) {
      return "Koneksi internet bermasalah. Periksa koneksi Anda dan coba lagi.";
    }

    if (errorMessage.includes("timeout")) {
      return "Koneksi timeout. Periksa koneksi internet Anda.";
    }

    // Default error message
    return errorMessage || "Terjadi kesalahan saat login. Silakan coba lagi.";
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form - akan menampilkan toast error jika ada yang salah
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await loginWithAPI(email, password);
      toast.success("Login berhasil! Mengarahkan ke dashboard...");

      // Delay sedikit untuk menampilkan toast
      setTimeout(() => {
        window.location.href = "/"; // Simple redirect to main page
      }, 1000);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);

      // Set specific field errors if applicable
      const errorResponse = error.response?.data;
      if (errorResponse?.error_type === "invalid_credentials") {
        setErrors({
          email: "Email atau password salah",
          password: "Email atau password salah",
        });
      } else if (errorResponse?.error_type === "user_not_found") {
        setErrors({
          email: "Akun dengan email ini tidak ditemukan",
        });
      } else if (errorResponse?.error_type === "invalid_email") {
        setErrors({
          email: "Format email tidak valid",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center md:text-left mb-8">
            <img
              src={logo}
              alt="SmedBox Logo"
              className="h-12 md:h-16 mb-8 mx-auto md:mx-0"
            />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Welcome Back!!
            </h1>
            <p className="text-gray-500">
              Masuk untuk melanjutkan perjalanan kesehatan Anda
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ${
                      errors.email ? "text-red-400" : "text-gray-400"
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`pl-10 w-full py-3 border rounded-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors.email
                      ? "border-red-300 focus:ring-red-100 focus:border-red-300"
                      : "border-gray-200 focus:ring-orange-100 focus:border-orange-200"
                  }`}
                  placeholder="email@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  className="text-sm text-orange-500 hover:text-orange-600"
                  onClick={() =>
                    toast.info("Fitur lupa password akan segera tersedia!")
                  }
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ${
                      errors.password ? "text-red-400" : "text-gray-400"
                    }`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 116 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`pl-10 w-full py-3 border rounded-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors.password
                      ? "border-red-300 focus:ring-red-100 focus:border-red-300"
                      : "border-gray-200 focus:ring-orange-100 focus:border-orange-200"
                  }`}
                  placeholder="Masukkan password Anda"
                  value={password}
                  onChange={handlePasswordChange}
                  disabled={loading}
                  minLength="6"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-100 hover:bg-orange-200 text-orange-800 font-medium py-3 px-6 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:opacity-70"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-orange-800 border-t-transparent mr-2"></div>
                  Memproses...
                </div>
              ) : (
                "Login"
              )}
            </button>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-gray-200 flex-grow"></div>
              <span className="mx-4 text-gray-500 text-sm">or</span>
              <div className="border-t border-gray-200 flex-grow"></div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Belum punya akun?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="font-medium text-orange-500 hover:text-orange-600 transition-colors"
                >
                  Daftar di sini
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden md:flex md:w-1/2 bg-orange-50 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 opacity-70"></div>
        <div className="relative z-10 p-8 flex items-center justify-center">
          <img
            src={maskot}
            alt="Maskot SmedBox"
            className="max-w-md w-full h-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
