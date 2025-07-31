import React, { useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { logo, maskot } from "../../assets";
import { toast } from "react-toastify";

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
      toast.error("Password tidak cocok!");
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

      toast.success("Registrasi berhasil! Mengarahkan ke halaman login...");

      // Delay untuk menampilkan success message
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      const errorMessage = err.message || "Terjadi kesalahan saat registrasi";
      dispatch({
        type: "SET_ERROR",
        value: errorMessage,
      });
      toast.error(errorMessage);
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
              Buat Akun Baru
            </h1>
            <p className="text-gray-500">
              Bergabung untuk mengelola kesehatan Anda dengan mudah
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={submitHandler}>
            {/* Success/Error Messages */}
            {state.success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm font-medium text-center">
                  {state.success}
                </p>
              </div>
            )}

            {state.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium text-center">
                  {state.error}
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
                  type="email"
                  name="email"
                  id="email"
                  placeholder="email@example.com"
                  className="pl-10 w-full py-3 border border-gray-200 rounded-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-200"
                  onChange={handleChange}
                  value={state.email}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  name="username"
                  id="username"
                  max={20}
                  placeholder="Username"
                  className="pl-10 w-full py-3 border border-gray-200 rounded-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-200"
                  onChange={handleChange}
                  value={state.username}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
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
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Min 6 karakter"
                    className="pl-10 w-full py-3 border border-gray-200 rounded-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-200"
                    onChange={handleChange}
                    value={state.password}
                    required
                    disabled={loading}
                    minLength="6"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
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
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    placeholder="Ulangi password"
                    className="pl-10 w-full py-3 border border-gray-200 rounded-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-200"
                    onChange={handleChange}
                    value={state.confirmPassword}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="noHp"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                No. WhatsApp
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <input
                  type="tel"
                  name="noHp"
                  id="noHp"
                  placeholder="08xxxxxxxxxx"
                  className="pl-10 w-full py-3 border border-gray-200 rounded-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-200"
                  onChange={handleChange}
                  value={state.noHp}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="profile"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Foto Profil (Opsional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  type="file"
                  name="profile"
                  id="profile"
                  accept="image/*"
                  className="pl-10 w-full py-3 border border-gray-200 rounded-full bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700"
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-100 hover:bg-orange-200 text-orange-800 font-medium py-3 px-6 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300 disabled:opacity-70 mt-4"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-orange-800 border-t-transparent mr-2"></div>
                  Mendaftar...
                </div>
              ) : (
                "Daftar Sekarang"
              )}
            </button>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Sudah punya akun?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="font-medium text-orange-500 hover:text-orange-600 transition-colors"
                >
                  Login di sini
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

export default Register;
