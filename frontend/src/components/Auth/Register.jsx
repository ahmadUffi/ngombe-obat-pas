import React, { useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { logo, backgroundRegister } from "../../assets";

const initialState = {
  email: "",
  username: "",
  password: "",
  confirmPassword: "",
  noHp: "",
  profile: null,
  error: null,
  success: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_ERROR":
      return { ...state, error: action.value, success: null };
    case "SET_SUCCESS":
      return { ...state, success: action.value, error: null };
    default:
      return state;
  }
}

const Register = () => {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value =
      e.target.name === "profile" ? e.target.files[0] : e.target.value;
    dispatch({ type: "SET_FIELD", field: e.target.name, value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch({ type: "SET_ERROR", value: null });

    if (state.password !== state.confirmPassword) {
      dispatch({ type: "SET_ERROR", value: "Password tidak cocok" });
      setLoading(false);
      return;
    }

    try {
      // Sign up
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: state.email,
          password: state.password,
          email_confirm: true,
        });

      if (signUpError) throw signUpError;

      const user = signUpData.user;

      console.log(user);

      // Upload profile image (opsional)
      let profileImgUrl = null;
      if (state.profile) {
        const fileExt = state.profile.name.split(".").pop();
        const filePath = `profile_${user.id}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("profile-images")
          .upload(filePath, state.profile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("profile-images")
          .getPublicUrl(filePath);

        profileImgUrl = publicUrlData.publicUrl;
      }

      // Save profile to table
      const { error: dbError } = await supabase.from("profile").insert([
        {
          user_id: user.id,
          email: state.email,
          username: state.username,
          no_hp: state.noHp,
          img_profile: profileImgUrl,
        },
      ]);

      if (dbError) throw dbError;

      dispatch({
        type: "SET_SUCCESS",
        value: "Registrasi berhasil! Mengarahkan ke halaman login...",
      });

      // Delay untuk menampilkan success message
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        value: err.message || "Terjadi kesalahan saat registrasi",
      });
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

        {/* Register Form Section */}
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
                Bergabung dengan SmedBox
              </h1>
              <p className="text-gray-600">
                Buat akun untuk mulai mengatur jadwal obat Anda
              </p>
            </div>

            {/* Success/Error Messages */}
            {state.success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-700 text-sm font-medium text-center">
                  {state.success}
                </p>
              </div>
            )}

            {state.error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm font-medium text-center">
                  {state.error}
                </p>
              </div>
            )}

            {/* Register Form */}
            <form onSubmit={submitHandler} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Masukkan email Anda"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  onChange={handleChange}
                  value={state.email}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  placeholder="Masukkan username Anda"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  onChange={handleChange}
                  value={state.username}
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
                  name="password"
                  placeholder="Masukkan password Anda"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  onChange={handleChange}
                  value={state.password}
                  required
                  disabled={loading}
                  minLength="6"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Konfirmasi password Anda"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  onChange={handleChange}
                  value={state.confirmPassword}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  No. WhatsApp
                </label>
                <input
                  type="tel"
                  name="noHp"
                  placeholder="Masukkan nomor WhatsApp Anda"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  onChange={handleChange}
                  value={state.noHp}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto Profil (Opsional)
                </label>
                <input
                  type="file"
                  name="profile"
                  accept="image/*"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl mt-6"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Mendaftar...
                  </div>
                ) : (
                  "Daftar Sekarang"
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-600 mb-3">Sudah punya akun?</p>
              <button
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 underline-offset-4 hover:underline"
              >
                Masuk sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
