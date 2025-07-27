import { supabase } from "../config/supabaseClient.js";

export const createControl = async (user_id, data) => {
  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("id")
    .eq("user_id", user_id)
    .single();

  if (profileError || !profile) throw new Error("Profile not found");

  const insertData = {
    user_id,
    nama_pasien: data.nama_pasien,
    profile_id: profile.id,
    tanggal: data.tanggal,
    dokter: data.dokter,
    waktu: data.waktu,
  };

  const { data: inserted, error: insertError } = await supabase
    .from("kontrol")
    .insert([insertData]);

  if (insertError) throw new Error("Failed to insert kontrol data");

  return inserted;
};

export const getControl = async (user_id) => {
  const { data, error } = await supabase
    .from("kontrol")
    .select("*")
    .eq("user_id", user_id);

  if (error) throw new Error("Error fetching data: " + error.message);

  // Always return an array, even if empty
  return data || [];
};

// update isDone at table control kolom isDOne
export const updateIsDone = async (id, isDone) => {
  // First verify the record exists
  const { data: existingRecord, error: checkError } = await supabase
    .from("kontrol")
    .select("id")
    .eq("id", id)
    .single();

  if (checkError || !existingRecord) {
    throw new Error("Control record not found");
  }

  const { data, error } = await supabase
    .from("kontrol")
    .update({ isDone })
    .eq("id", id);

  if (error) throw new Error("Error updating isDone status: " + error.message);

  return { success: true, message: "Status updated successfully" };
};

// update supabse
export const updateControl = async (id, updatedData) => {
  const { data, error } = await supabase
    .from("kontrol")
    .update(updatedData)
    .eq("id", id);

  if (error) throw new Error("Failed to update control data");
  return data;
};

export const deleteControl = async (id, user_id) => {
  // First check if the control belongs to the user
  const { data: control, error: errorCheck } = await supabase
    .from("kontrol")
    .select("id")
    .eq("id", id)
    .eq("user_id", user_id)
    .single();

  if (errorCheck || !control) {
    throw new Error("Kontrol tidak ditemukan atau Anda tidak memiliki akses");
  }

  const { data, error } = await supabase
    .from("kontrol")
    .delete()
    .eq("id", id)
    .eq("user_id", user_id);

  if (error) throw new Error("Gagal menghapus data kontrol: " + error.message);

  return { success: true };
};
