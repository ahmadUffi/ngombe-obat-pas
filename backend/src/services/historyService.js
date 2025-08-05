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
  console.log(dataJadwal);
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

// Create history for control activities
export const createControlHistory = async (user_id, controlData, status) => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from("profile")
      .select("id")
      .eq("user_id", user_id)
      .single();

    if (profileError || !profile) throw new Error("Profile not found");

    const insertData = {
      user_id: user_id,
      profile_id: profile.id,
      nama_obat: `Kontrol: ${controlData.nama_pasien}`, // Clear identifier for control activities
      dosis_obat: `Dr. ${controlData.dokter}`,
      sisa_obat: 0, // Control doesn't have sisa_obat concept
      status: status,
      waktu_minum: `${controlData.tanggal} ${controlData.waktu}`,
    };

    const { data, error: createError } = await supabase
      .from("history")
      .insert([insertData])
      .select(); // Return the inserted data

    if (createError) {
      throw new Error(
        "Failed to create control history: " + createError.message
      );
    }

    return data;
  } catch (error) {
    console.error("Error creating control history:", error);
    // Don't throw error to prevent breaking the main control operation
    // Just log it for debugging
    return null;
  }
};
