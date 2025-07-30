import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { backgroundRegister, logo } from "../../assets";
import { AuthContext } from "../../hooks/useAuth";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { loginWithAPI } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await loginWithAPI(email, password);
      console.log("✅ Login berhasil!");
      console.log("Token:", response.access_token);

      toast.success("Login berhasil! Mengarahkan ke dashboard...");

      // Delay sedikit untuk menampilkan toast
      setTimeout(() => {
        window.location.href = "/"; // Simple redirect to main page
      }, 1000);
    } catch (error) {
      toast.error(
        error.message || "Login gagal. Periksa email dan password Anda."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="grid lg:grid-cols-2 w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Image Section */}
        <div className="relative hidden lg:block">
          <img
            src={backgroundRegister}
            alt="Medical Background"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
        </div>

        {/* Login Form Section */}
        <div className="flex flex-col justify-center p-8 lg:p-12">
          <div className="w-full max-w-md mx-auto space-y-8">
            {/* Logo and Title */}
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <img
                  src={logo}
                  alt="SmedBox Logo"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Selamat Datang Kembali
              </h1>
              <p className="text-gray-600">Masuk ke akun SmedBox Anda</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Masukkan email Anda"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Masukkan password Anda"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength="6"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Memproses...
                  </div>
                ) : (
                  "Masuk"
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-gray-600 mb-3">Belum punya akun?</p>
              <button
                onClick={() => navigate("/register")}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 underline-offset-4 hover:underline"
              >
                Daftar sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
