import { supabase } from "../config/supabaseClient.js";
import { createHistory } from "./historyService.js";

export const createJadwal = async (user_id, data) => {
  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("id")
    .eq("user_id", user_id)
    .single();
  if (profileError || !profile) throw new Error("Gagal mengambil profile_id");

  const { data: existSlot, error: cekSlotError } = await supabase
    .from("jadwal")
    .select("slot_obat")
    .eq("user_id", user_id)
    .eq("slot_obat", data.slot_obat);

  if (cekSlotError || existSlot.length > 0)
    throw new Error("Slot obat sudah terisi");

  const insertData = {
    user_id,
    profile_id: profile.id,
    nama_pasien: data.nama_pasien,
    nama_obat: data.nama_obat,
    dosis_obat: data.dosis_obat,
    jumlah_obat: data.jumlah_obat,
    jam_awal: data.jam_awal,
    jam_berakhir: data.jam_berakhir,
    catatan: data.catatan || "",
    kategori: data.kategori || "",
    slot_obat: data.slot_obat || "",
  };

  const { data: result, error: errorInput } = await supabase
    .from("jadwal")
    .insert([insertData])
    .select()
    .single();

  if (errorInput) throw new Error(errorInput.message);

  // Create history record for new jadwal
  try {
    await createHistory(user_id, result.id, "jadwal baru dibuat");
  } catch (historyError) {
    console.error("Failed to create history for new jadwal:", historyError);
    // Continue with the function even if history creation fails
  }
};

export const getJadwalByID = async (user_id) => {
  const { data: result, error } = await supabase
    .from("jadwal")
    .select("*")
    .eq("user_id", user_id);

  if (error) throw new Error("Gagal mengambil data jadwal: " + error.message);
  return result;
};

export const getJadwalByIDProfile = async (user_id) => {
  const { data: profile, error: profileError } = await supabase
    .from("profile")
    .select("no_hp")
    .eq("user_id", user_id)
    .single();

  if (profileError || !profile)
    throw new Error("Gagal mengambil data profile: " + profileError.message);

  const { data: jadwalList, error: jadwalError } = await supabase
    .from("jadwal")
    .select(
      "id,  nama_pasien, nama_obat, dosis_obat, jumlah_obat, kategori, slot_obat, catatan , jam_awal, jam_berakhir"
    )
    .eq("user_id", user_id);

  if (jadwalError || !jadwalList)
    throw new Error("Gagal mengambil data jadwal: " + jadwalError.message);

  return {
    no_hp: profile.no_hp,
    jadwalMinum: jadwalList.map((jadwal) => ({
      ...jadwal,
    })),
  };
};

export const updateObatByID = async (id_jadwal, own, newStock) => {
  const { data: result, error: errorJumlahObat } = await supabase
    .from("jadwal")
    .select("jumlah_obat, user_id")
    .eq("id", id_jadwal)
    .single();

  if (errorJumlahObat || !result)
    throw new Error(
      "Gagal mengambil data obat: " +
        (errorJumlahObat ? errorJumlahObat.message : "Data tidak ditemukan")
    );

  let stockObat;
  let status;

  if (own == "iot") {
    stockObat = result.jumlah_obat - 1;
    status = "diminum";
  }

  if (own == "web") {
    stockObat = newStock;
    status =
      newStock > result.jumlah_obat ? "stock ditambah" : "stock dikurangi";
  }

  const { data, error: errorUpdate } = await supabase
    .from("jadwal")
    .update({ jumlah_obat: stockObat })
    .eq("id", id_jadwal);

  if (errorUpdate)
    throw new Error("Gagal mengupdate data obat: " + errorUpdate.message);

  // Create history record for stock update
  try {
    const user_id = result.user_id;
    await createHistory(user_id, id_jadwal, status);
  } catch (historyError) {
    console.error("Failed to create history for stock update:", historyError);
    // Continue with the function even if history creation fails
  }

  // Check if stock is empty or very low and add another history entry
  if (stockObat <= 0) {
    try {
      await createHistory(result.user_id, id_jadwal, "stock habis");
    } catch (historyError) {
      console.error("Failed to create 'stock habis' history:", historyError);
    }
  } else if (stockObat <= 5) {
    try {
      await createHistory(result.user_id, id_jadwal, "stock menipis");
    } catch (historyError) {
      console.error("Failed to create 'stock menipis' history:", historyError);
    }
  }
};

export const deleteJadwal = async (id_jadwal, user_id) => {
  // First check if the jadwal belongs to the user
  const { data: jadwal, error: errorCheck } = await supabase
    .from("jadwal")
    .select("*")
    .eq("id", id_jadwal)
    .eq("user_id", user_id)
    .single();

  if (errorCheck || !jadwal) {
    throw new Error("Jadwal tidak ditemukan atau Anda tidak memiliki akses");
  }

  // Create history record before deleting the jadwal
  try {
    // We'll use the existing data to create a comprehensive history entry
    const historyData = {
      user_id: user_id,
      profile_id: jadwal.profile_id,
      nama_obat: jadwal.nama_obat,
      dosis_obat: jadwal.dosis_obat,
      sisa_obat: jadwal.jumlah_obat,
      status: "jadwal dihapus",
      waktu_minum: jadwal.jam_awal,
    };

    // Insert history record directly since we're about to delete the jadwal
    // and createHistory function wouldn't be able to find it
    const { data: profile, error: profileError } = await supabase
      .from("profile")
      .select("id")
      .eq("user_id", user_id)
      .single();

    if (profileError || !profile) {
      console.error("Profile not found when creating deletion history");
    } else {
      const { error: createError } = await supabase
        .from("history")
        .insert([historyData]);

      if (createError) {
        console.error(
          "Failed to create history for deleted jadwal:",
          createError.message
        );
      }
    }
  } catch (historyError) {
    console.error("Failed to create history before deletion:", historyError);
    // Continue with deletion even if history creation fails
  }

  // Now delete the jadwal
  const { data, error: errorDelete } = await supabase
    .from("jadwal")
    .delete()
    .eq("id", id_jadwal)
    .eq("user_id", user_id);

  if (errorDelete)
    throw new Error("Gagal menghapus data jadwal: " + errorDelete.message);
};
