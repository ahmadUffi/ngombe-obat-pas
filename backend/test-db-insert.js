import { supabase } from "./src/config/supabaseClient.js";

// Test direct database insert
async function testInsert() {
  try {
    const testData = {
      user_id: "550e8400-e29b-41d4-a716-446655440000", // dummy UUID
      profile_id: "550e8400-e29b-41d4-a716-446655440001", // dummy UUID
      tanggal: "2025-08-10",
      waktu: "10:00",
      dokter: "Dr. Test",
      nama_pasien: "Test Patient",
    };

    console.log("Testing insert with data:", testData);

    const { data, error } = await supabase
      .from("kontrol")
      .insert([testData])
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
    } else {
      console.log("Insert success:", data);
    }
  } catch (error) {
    console.error("Test error:", error);
  }
}

testInsert();
