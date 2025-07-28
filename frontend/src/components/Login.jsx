import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { backgroundRegister, logo } from "../assets";
import { AuthContext } from "../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const { token, loginWithAPI, error } = useContext(AuthContext);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const response = await loginWithAPI(email, password);
      console.log("✅ Login berhasil!");
      console.log("Token:", response.access_token);
      setSuccessMsg("Login berhasil! Redirecting...");
      // Redirect logic can be added here
      window.location.href = "/"; // Simple redirect to main page
    } catch (error) {
      setErrorMsg(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="login grid lg:grid-cols-2 grid-rows-2 lg:grid-rows-1 items-center h-[100dvh] overflow-hidden">
      <div className="gambar order-2 lg:order-1 relative z-10">
        <img
          src={backgroundRegister}
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
      <div
        className="w-[347px] p-5 rounded-xl flex flex-col items-center gap-10 shadow-xl"
        style={{ backgroundColor: "rgba(191,191,191, .7)" }}
      >
        <div className="logo">
          <img src={logo} alt="logo" width={100} height={100} />
        </div>

        <h2 className="text-xl font-bold text-gray-800 text-center">
          Masuk ke Akun Anda
        </h2>

        {successMsg && (
          <div className="w-full p-3 bg-green-100 border border-green-300 rounded-lg">
            <p className="text-green-600 text-sm text-center">{successMsg}</p>
          </div>
        )}

        {(errorMsg || error) && (
          <div className="w-full p-3 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-600 text-sm text-center">
              {errorMsg || error}
            </p>
          </div>
        )}

        {successMsg && (
          <div className="w-full p-3 bg-green-100 border border-green-300 rounded-lg">
            <p className="text-green-600 text-sm text-center">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col w-full">
          <input
            type="email"
            placeholder="Masukan Email Anda"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Masukan Password Anda"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            minLength="6"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-white w-max py-1.5 px-5 rounded-md m-auto cursor-pointer hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        {/* Link to Register */}
        <div className="text-center text-sm">
          <p className="text-gray-700 mb-2">Belum punya akun?</p>
          <button
            onClick={() => navigate("/register")}
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            Daftar di sini
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
