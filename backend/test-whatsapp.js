import axios from "axios";

// Test data
const testJadwal = {
  nama_pasien: "Ahmad Test",
  nama_obat: "Paracetamol",
  dosis_obat: "500",
  jumlah_obat: 30,
  jam_awal: ["08:00", "12:00", "16:00", "20:00"],
  jam_berakhir: "2025-08-20",
  catatan: "Test WhatsApp integration",
  kategori: "test",
  slot_obat: "1",
};

const BASE_URL = "http://localhost:5001/v1/api";

// Function to create test jadwal
async function testCreateJadwal() {
  try {
    console.log("🧪 Testing Create Jadwal with WhatsApp Integration...\n");

    // You need to replace this with actual auth token
    const token = "your_jwt_token_here";

    const response = await axios.post(`${BASE_URL}/jadwal/create`, testJadwal, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ Jadwal created successfully!");
    console.log("📋 Response:", response.data);

    return response.data.data.id;
  } catch (error) {
    console.error(
      "❌ Error creating jadwal:",
      error.response?.data || error.message
    );
    return null;
  }
}

// Function to test delete jadwal
async function testDeleteJadwal(jadwalId) {
  try {
    console.log(`\n🗑️  Testing Delete Jadwal: ${jadwalId}...\n`);

    const token = "your_jwt_token_here";

    const response = await axios.delete(
      `${BASE_URL}/jadwal/delete/${jadwalId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("✅ Jadwal deleted successfully!");
    console.log("📋 Response:", response.data);
  } catch (error) {
    console.error(
      "❌ Error deleting jadwal:",
      error.response?.data || error.message
    );
  }
}

// Function to test phone format
function testPhoneFormat() {
  console.log("\n📱 Testing Phone Number Formatting...\n");

  const { formatPhoneNumber } = require("./src/services/wablasService.js");

  const testNumbers = [
    "08123456789",
    "8123456789",
    "628123456789",
    "+628123456789",
    "0812-3456-789",
  ];

  testNumbers.forEach((number) => {
    const formatted = formatPhoneNumber(number);
    console.log(`${number} → ${formatted}`);
  });
}

// Function to test message generation
function testMessageGeneration() {
  console.log("\n💬 Testing Message Generation...\n");

  const {
    generateReminderMessage,
  } = require("./src/services/wablasService.js");

  const testMessage = generateReminderMessage(testJadwal, "08:00");
  console.log("Generated message:");
  console.log(testMessage);
}

// Main test function
async function runTests() {
  console.log("🚀 WhatsApp Integration Tests\n");
  console.log("=====================================\n");

  // Test phone formatting
  testPhoneFormat();

  // Test message generation
  testMessageGeneration();

  // Note: Uncomment below to test actual API calls
  // Make sure to update the JWT token and ensure user has valid profile with no_hp

  /*
  const jadwalId = await testCreateJadwal();
  
  if (jadwalId) {
    // Wait a bit before testing delete
    setTimeout(async () => {
      await testDeleteJadwal(jadwalId);
    }, 5000);
  }
  */

  console.log("\n✅ Tests completed!");
  console.log("\n📝 To test API calls:");
  console.log("1. Update JWT token in this file");
  console.log("2. Ensure user profile has valid no_hp");
  console.log("3. Uncomment API test code");
  console.log("4. Run: node test-whatsapp.js");
}

// Run tests
runTests();
