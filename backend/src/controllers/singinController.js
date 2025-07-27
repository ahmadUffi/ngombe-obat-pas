import { loginAkun } from "../services/signinService.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const LoginWithPaddword = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email dan password harus diisi",
    });
  }

  const { dataLogin } = await loginAkun(email, password);

  res.status(200).json({
    success: true,
    message: "Login berhasil",
    access_token: dataLogin.session.access_token,
  });
});
