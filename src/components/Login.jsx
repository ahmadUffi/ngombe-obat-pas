import { useContext, useState } from "react";
import { backgroundRegister, logo } from "../assets";
import { AuthContext } from "../hooks/useAuth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { token, loginHandle } = useContext(AuthContext);

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
      const response = await loginHandle(email, password);
      console.log(response.session);
      // console.log("✅ Login berhasil!");
      // console.log("Token:", session.access_token);
      // console.log("User ID:", user.id);
      // alert("Login berhasil!");
      // redirect bisa di sini
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

        {errorMsg && (
          <p className="text-red-600 text-sm text-center">{errorMsg}</p>
        )}

        <form onSubmit={handleLogin} className="flex flex-col">
          <input
            type="email"
            placeholder="Masukan Email Anda"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Masukan Password Anda"
            style={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-white w-max py-1.5 px-5  rounded-md m-auto cursor-pointer hover:bg-gray-200"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
