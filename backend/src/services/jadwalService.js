import { supabase } from "../config/supabaseClient.js";

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
    .select("jumlah_obat")
    .eq("id", id_jadwal)
    .single();

  if (errorJumlahObat || !result)
    throw new Error("Gagal mengambil data obat: " + errorJumlah);
  let stockObat;
  if (own == "iot") stockObat = result.jumlah_obat - 1;
  if (own == "web") stockObat = newStock;
  const { data, error: errorUpdate } = await supabase
    .from("jadwal")
    .update({ jumlah_obat: stockObat })
    .eq("id", id_jadwal);

  if (errorUpdate)
    throw new Error("Gagal mengupdate data obat: " + errorUpdate.message);
};

export const deleteJadwal = async (id_jadwal) => {
  const { data, error: errorDelete } = await supabase
    .from("jadwal")
    .delete()
    .eq("id", id_jadwal);

  if (errorDelete)
    throw new Error("Gagal menghapus data jadwal: " + errorDelete.message);
};
