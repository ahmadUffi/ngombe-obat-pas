import { supabase } from "../config/supabaseClient.js";

export const loginAkun = async (email, password) => {
  const { data: dataLogin, error: loginError } =
    await supabase.auth.signInWithPassword({ email, password });

  if (loginError) throw new Error(loginError.message);

  return { dataLogin };
};
