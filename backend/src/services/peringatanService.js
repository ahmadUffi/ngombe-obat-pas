import { supabase } from "../config/supabaseClient.js";

//  Create Peringatan
export const createPeringatan = async (user_id, id_jadwal, pesan) => {
  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("id")
    .eq("user_id", user_id)
    .single();

  if (profileError || !profile) throw new Error("Profile not found");
  const { data: dataJadwal, error: dataError } = await supabase
    .from("jadwal")
    .select("nama_obat, slot_obat")
    .eq("user_id", user_id)
    .eq("id", id_jadwal)
    .single();

  if (dataError || !dataJadwal) throw new Error("Jadwal not found");

  const insertData = {
    user_id,
    profile_id: profile.id,
    nama_obat: dataJadwal.nama_obat,
    slot_obat: dataJadwal.slot_obat,
    pesan,
  };

  // Insert ke tabel peringatan
  const { data, error: insertError } = await supabase
    .from("peringatan")
    .insert([insertData]);

  if (insertError) {
    throw new Error("Failed to create peringatan: " + insertError.message);
  }

  return data;
};

// ✅ Get All Peringatan for a User
export const getPeringatan = async (user_id) => {
  const { data, error } = await supabase
    .from("peringatan")
    .select("*")
    .eq("user_id", user_id);

  if (error) throw new Error("Failed to fetch peringatan: " + error.message);

  return data;
};
