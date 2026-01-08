// middleware/supabase.js
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ override: true });

const supabase = createClient(
  process.env.SUPABASE_API_URL,
  process.env.SUPABASE_API_ROLE_KEY
);
const supabaseMiddleware = (req, res, next) => {
  req.supabase = supabase;
  next();
};

export default supabaseMiddleware;
