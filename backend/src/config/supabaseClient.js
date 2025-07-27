import { createClient } from "@supabase/supabase-js";
import { config as dotenvConfig } from "dotenv";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenvConfig({ path: path.resolve(__dirname, "../../.env") });

const supabaseURl = process.env.SUPABASE_API_URL;
const supabaseAnon = process.env.SUPABASE_API_ANON;
const supabaseRLS = process.env.SUPABASE_API_ROLE_KEY;

if (!supabaseAnon && !supabaseURl) {
  console.log("silahkan masukan .env terlebih dahulu");
  process.exit(1);
}

const supabase = createClient(supabaseURl, supabaseRLS);

export { supabase };
