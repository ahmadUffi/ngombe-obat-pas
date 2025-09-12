import { supabase } from "../config/supabaseClient.js";

export const createHistory = async (user_id, id, status) => {
  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("id")
    .eq("user_id", user_id)
    .single();

  if (profileError || !profile) throw new Error("Profile not found");

  const { data: dataJadwal, error: dataEror } = await supabase
    .from("jadwal")
    .select("*")
    .eq("user_id", user_id)
    .eq("id", id)
    .single();

  if (dataEror) throw new Error("Data Jadwal not found");
  const insertData = {
    user_id: user_id,
    profile_id: profile.id,
    nama_obat: dataJadwal.nama_obat,
    dosis_obat: dataJadwal.dosis_obat,
    sisa_obat: dataJadwal.jumlah_obat,
    status: status,
    waktu_minum: dataJadwal.jam_awal,
  };

  const { data, error: creaateError } = await supabase
    .from("history")
    .insert([insertData]);

  if (creaateError) {
    throw new Error("Failed to create history" + creaateError.message);
  }
};

export const getHistory = async (user_id) => {
  const { data: dataHistory, error: dataError } = await supabase
    .from("history")
    .select("*")
    .eq("user_id", user_id);

  if (dataError) throw new Error("Failed to get history" + dataError.message);

  return { dataHistory };
};
