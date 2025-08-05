// Test Array-based Reminder Implementation

import {
  formatStartDate,
  generateReminderMessage,
  formatPhoneNumber,
} from "./src/services/wablasService.js";

console.log("🧪 Testing Array-based WhatsApp Reminder Implementation\n");

// Test data
const testJadwalData = {
  nama_pasien: "Ahmad Test",
  nama_obat: "Paracetamol",
  dosis_obat: "500mg",
  jam_awal: ["08:00", "12:00", "16:00", "20:00"],
};

console.log("📋 Test Jadwal Data:");
console.log("- Nama Pasien:", testJadwalData.nama_pasien);
console.log("- Nama Obat:", testJadwalData.nama_obat);
console.log("- Jam Awal:", testJadwalData.jam_awal);
console.log("");

// Simulate the new array-based approach
console.log("🔄 New Array-based Implementation Flow:");
console.log("");

const reminderIds = [];
const jamReminders = [];

console.log("1️⃣ Processing jam_awal array:");
testJadwalData.jam_awal.forEach((jam, index) => {
  console.log(`   ${index + 1}. Processing jam: ${jam}`);

  // Simulate Wablas response
  const mockWablasId = `wablas_${Date.now()}_${index}`;

  jamReminders.push(jam);
  reminderIds.push(mockWablasId);

  console.log(`      → Wablas ID: ${mockWablasId}`);
});

console.log("");
console.log("2️⃣ Collected Arrays:");
console.log("   jam_reminders:", jamReminders);
console.log("   wablas_reminder_ids:", reminderIds);
console.log("");

console.log("3️⃣ Database Record (1 record instead of 4):");
console.log(`
INSERT INTO jadwal_wa_reminders (
  jadwal_id, 
  user_id, 
  jam_reminders, 
  wablas_reminder_ids
) VALUES (
  'jadwal-uuid-123',
  'user-uuid-456', 
  ARRAY[${jamReminders.map((j) => `'${j}'`).join(", ")}],
  ARRAY[${reminderIds.map((id) => `'${id}'`).join(", ")}]
);
`);

console.log("4️⃣ Delete Implementation:");
console.log("   When deleting jadwal:");
console.log("   1. Get reminder record");
console.log("   2. Loop through wablas_reminder_ids array");
console.log("   3. Delete each ID from Wablas");
console.log("   4. Delete database record");
console.log("");

console.log("✅ Benefits of Array Approach:");
console.log("   ✅ 1 database record instead of 4");
console.log("   ✅ Perfect mapping between jam and reminder ID");
console.log("   ✅ Atomic operations for create/delete");
console.log("   ✅ No mismatch issues");
console.log("   ✅ Easier debugging and maintenance");
console.log("");

console.log("📊 Comparison:");
console.log("");
console.log("   OLD (separate records):");
console.log("   ├── 4 database records");
console.log("   ├── Complex mapping for delete");
console.log("   └── Potential ID mismatch");
console.log("");
console.log("   NEW (array approach):");
console.log("   ├── 1 database record");
console.log("   ├── Perfect array mapping");
console.log("   └── No ID mismatch possible");
console.log("");

console.log("🚀 Ready for testing!");
