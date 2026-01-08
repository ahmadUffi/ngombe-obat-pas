import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { logo, maskot } from "../../assets";
import { toast } from "react-toastify";
import { apiService } from "../../api/apiservice";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi email
    if (!email.trim()) {
      toast.error("Email harus diisi!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Format email tidak valid!");
      return;
    }

    setLoading(true);

    try {
      await apiService.forgotPassword({ email });
      setSubmitted(true);
      toast.success("Jika email terdaftar, link reset password telah dikirim!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Terjadi kesalahan saat mengirim email reset password";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen w-full bg-white flex flex-col md:flex-row overflow-hidden">
        {/* Left side - Success Message */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-md text-center">
            {/* Logo */}
            <img
              src={logo}
              alt="Ngompas Logo"
              className="h-12 md:h-16 mb-8 mx-auto"
            />

            {/* Success Icon */}
            <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Email Terkirim!
            </h1>

            <p className="text-gray-600 mb-6">
              Jika email <strong>{email}</strong> terdaftar di sistem kami, link
              untuk reset password telah dikirim ke inbox Anda.
            </p>

            <p className="text-gray-500 text-sm mb-8">
              Silakan cek email Anda dan klik link yang diberikan untuk reset
              password. Jika tidak menemukan email, periksa folder spam/junk.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-orange-100 hover:bg-orange-200 text-orange-800 font-medium py-3 px-6 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
              >
                Kembali ke Login
              </button>

              <button
                onClick={() => {
                  setSubmitted(false);
                  setEmail("");
                }}
                className="w-full text-gray-600 hover:text-gray-800 font-medium py-2 transition-colors"
              >
                Kirim ulang ke email lain
              </button>
            </div>
          </div>
        </div>

        {/* Right side - Image */}
        <div className="hidden md:flex md:w-1/2 bg-orange-50 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-orange-100 opacity-70"></div>
          <div className="relative z-10 p-8 flex items-center justify-center">
            <img
              src={maskot}
              alt="Maskot Ngompas"
              className="max-w-md w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center md:text-left mb-8">
            <img
              src={logo}
              alt="Ngompas Logo"
              className="h-18 md:h-32 mb-8 mx-auto"
            />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Lupa Password?
            </h1>
            <p className="text-gray-500">
              Masukkan email Anda dan kami akan mengirim link untuk reset
              password
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
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
                  className="pl-10 w-full py-3 border border-gray-200 rounded-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-200"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-100 hover:bg-orange-200 text-orange-800 font-medium py-3 px-6 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:opacity-70"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-orange-800 border-t-transparent mr-2"></div>
                  Mengirim Email...
                </div>
              ) : (
                "Kirim Link Reset Password"
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-sm cursor-pointer text-orange-500 hover:text-orange-600 transition-colors"
              >
                ← Kembali ke Login
              </button>
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
            alt="Maskot Ngompas"
            className="max-w-md w-full h-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
