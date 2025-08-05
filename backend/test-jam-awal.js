// Test for WhatsApp Integration - jam_awal usage

import {
  formatStartDate,
  generateReminderMessage,
  formatPhoneNumber,
} from "./src/services/wablasService.js";

console.log("🧪 Testing WhatsApp Integration - jam_awal Usage\n");

// Test data yang simulate request jadwal
const testJadwalData = {
  nama_pasien: "Ahmad Test",
  nama_obat: "Paracetamol",
  dosis_obat: "500mg",
  jam_awal: ["08:00", "12:00", "16:00", "20:00"], // Multiple times
  // ... other fields
};

console.log("📋 Test Jadwal Data:");
console.log("- Nama Pasien:", testJadwalData.nama_pasien);
console.log("- Nama Obat:", testJadwalData.nama_obat);
console.log("- Dosis:", testJadwalData.dosis_obat);
console.log("- Jam Awal:", testJadwalData.jam_awal);
console.log("");

// Test phone number formatting
const testPhones = ["08123456789", "8123456789", "628123456789"];
console.log("📱 Phone Number Formatting:");
testPhones.forEach((phone) => {
  console.log(`${phone} → ${formatPhoneNumber(phone)}`);
});
console.log("");

// Test reminder creation for each jam_awal
console.log("⏰ Processing jam_awal array:");
console.log("");

testJadwalData.jam_awal.forEach((jam, index) => {
  console.log(`${index + 1}. Jam: ${jam}`);

  // Generate message for this time
  const message = generateReminderMessage(testJadwalData, jam);
  console.log("   Message:");
  console.log("   " + message.replace(/\n/g, "\n   "));

  // Generate start date
  const startDate = formatStartDate(jam);
  console.log(`   Start Date: ${startDate}`);

  console.log("   ---");
  console.log("");
});

console.log("✅ Summary:");
console.log(`- Total reminders akan dibuat: ${testJadwalData.jam_awal.length}`);
console.log("- Setiap jam di jam_awal array mendapat reminder terpisah");
console.log(
  "- Message include nama_pasien, nama_obat, dosis, dan jam specific"
);
console.log("- Phone number di-format ke 62xxx otomatis");
console.log("");

console.log("🔄 Flow dalam createJadwal:");
console.log("1. Get profile dengan no_hp");
console.log("2. Format phone number");
console.log("3. Create jadwal record");
console.log("4. Loop data.jam_awal:");
console.log("   - Generate message untuk jam ini");
console.log("   - Create Wablas reminder");
console.log("   - Save reminder_id ke database");
console.log("5. Jika sukses semua → return jadwal");
console.log("6. Jika ada yang gagal → cleanup & rollback");
