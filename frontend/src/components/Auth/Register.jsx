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

  const styles = {
    input: {
      width: "317px",
      padding: "10px",
      borderRadius: "5px",
      marginBottom: "10px",
      outline: "none",
      border: "1px solid #ccc",
      backgroundColor: "white",
    },
  };

  return (
    <div className="regiter grid  lg:grid-cols-2 grid-rows-2 lg:grid-rows-1 items-center h-[100dvh] overflow-hidden">
      <div className="gambar order-2 lg:order-1 relative z-10">
        <img
          src={backgroundRegister}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
      <div className="relative z-20 lg:flex items-center order-1 lg:order-2 md:order-1">
        <div className="w-[290px] md:w-[387px] fixed top-[40%] translate-y-[-40%] lg:translate-y-[0] shadow-xl left-[50%] translate-x-[-50%] lg:translate-x-[0] lg:static z-30 bg-[#FFE7DF] h-max p-6 rounded-xl flex flex-col m-auto items-center gap-10">
          <div className="logo">
            <img src={logo} alt="logo" className="w-19 md:w-25" />
          </div>
          {state.success && (
            <div className="w-full p-3 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-green-600 text-sm text-center">
                {state.success}
              </p>
            </div>
          )}
          {state.error && (
            <div className="w-full p-3 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-600 text-sm text-center">{state.error}</p>
            </div>
          )}{" "}
          <form onSubmit={submitHandler} className="flex  w-full flex-col px-1">
            <input
              type="email"
              name="email"
              placeholder="Masukkan Email Anda"
              className="w-full md: px-4 py-2 mb-2 rounded-md border border-gray-300 outline-none bg-white text-sm sm:text-base"
              onChange={handleChange}
              value={state.email}
              required
              disabled={loading}
            />
            <input
              type="text"
              name="username"
              placeholder="Masukkan Username Anda"
              className="w-full md: px-4 py-2 mb-2 rounded-md border border-gray-300 outline-none bg-white text-sm sm:text-base"
              onChange={handleChange}
              value={state.username}
              required
              disabled={loading}
            />
            <input
              type="password"
              name="password"
              placeholder="Masukkan Password Anda"
              className="w-full md: px-4 py-2 mb-2 rounded-md border border-gray-300 outline-none bg-white text-sm sm:text-base"
              onChange={handleChange}
              value={state.password}
              required
              disabled={loading}
              minLength="6"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Konfirmasi Password"
              className="w-full md: px-4 py-2 mb-2 rounded-md border border-gray-300 outline-none bg-white text-sm sm:text-base"
              onChange={handleChange}
              value={state.confirmPassword}
              required
              disabled={loading}
            />
            <input
              type="tel"
              name="noHp"
              placeholder="Masukkan No WhatsApp Anda"
              className="w-full md: px-4 py-2 mb-2 rounded-md border border-gray-300 outline-none bg-white text-sm sm:text-base"
              onChange={handleChange}
              value={state.noHp}
              required
              disabled={loading}
            />
            <input
              type="file"
              name="profile"
              accept="image/*"
              className="w-full md: px-4 py-2 mb-2 rounded-md border border-gray-300 outline-none bg-white text-sm sm:text-base"
              onChange={handleChange}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-white w-max py-1.5 px-5 rounded-md m-auto cursor-pointer hover:bg-gray-200 disabled:opacity-50"
            >
              {loading ? "Mendaftar..." : "Daftar"}
            </button>
          </form>
          {/* Link to Login */}
          <div className="text-center text-sm mt-4">
            <p className="text-gray-700 mb-2">Sudah punya akun?</p>
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              Masuk di sini
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
