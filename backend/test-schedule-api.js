import axios from "axios";

// Test configuration
const BASE_URL = "http://localhost:5001/v1/api";
const TEST_TOKEN = "YOUR_JWT_TOKEN_HERE"; // Replace with actual JWT token
const TEST_PHONE = "081234567890"; // Replace with actual phone number

// Test data for control appointment
const testControlData = {
  tanggal: "2025-08-10",
  dokter: "Dr. Ahmad Fauzi, Sp.PD",
  waktu: "14:00",
  nama_pasien: "Testing Patient",
  enableReminder: true,
};

/**
 * Test creating control with automatic WhatsApp scheduling
 */
async function testCreateControlWithSchedule() {
  try {
    console.log("🧪 Testing Create Control with WhatsApp Schedule...\n");

    const response = await axios.post(
      `${BASE_URL}/kontrol/create-kontrol`,
      testControlData,
      {
        headers: {
          Authorization: `Bearer ${TEST_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Control created successfully!");
    console.log("📋 Response:", response.data);

    return response.data.data?.id;
  } catch (error) {
    console.error(
      "❌ Error creating control:",
      error.response?.data || error.message
    );
    return null;
  }
}

/**
 * Test manual WhatsApp schedule creation
 */
async function testManualScheduleCreation() {
  try {
    console.log("\n🧪 Testing Manual WhatsApp Schedule Creation...\n");

    // Schedule for tomorrow at 09:00
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const scheduleDate = tomorrow.toISOString().split("T")[0];

    const scheduleData = {
      phone: TEST_PHONE,
      date: scheduleDate,
      time: "09:00:00",
      timezone: "Asia/Jakarta",
      message: `🩺 *Test Pengingat Kontrol Dokter*

📅 Tanggal: ${testControlData.tanggal}
⏰ Waktu: ${testControlData.waktu}
👨‍⚕️ Dokter: ${testControlData.dokter}
👤 Pasien: ${testControlData.nama_pasien}

Jangan lupa untuk datang tepat waktu ya! 😊

_Pesan test dari SmedBox_`,
    };

    const response = await axios.post(
      `${BASE_URL}/schedule/create-control-reminder`,
      scheduleData,
      {
        headers: {
          Authorization: `Bearer ${TEST_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Manual schedule created successfully!");
    console.log("📋 Response:", response.data);

    return response.data.data?.schedule_id;
  } catch (error) {
    console.error(
      "❌ Error creating manual schedule:",
      error.response?.data || error.message
    );
    return null;
  }
}

/**
 * Test getting user's active schedule reminders
 */
async function testGetUserScheduleReminders() {
  try {
    console.log("\n🧪 Testing Get User Schedule Reminders...\n");

    const response = await axios.get(
      `${BASE_URL}/schedule/get-user-reminders`,
      {
        headers: {
          Authorization: `Bearer ${TEST_TOKEN}`,
        },
      }
    );

    console.log("✅ Schedule reminders retrieved successfully!");
    console.log("📋 Response:", response.data);
    console.log(`📊 Total reminders: ${response.data.count}`);

    // Show control details with schedule IDs
    if (response.data.data.length > 0) {
      console.log("\n📋 Controls with WhatsApp Schedule:");
      response.data.data.forEach((control, index) => {
        console.log(
          `${index + 1}. ${control.dokter} - ${control.tanggal} ${
            control.waktu
          }`
        );
        console.log(`   Schedule ID: ${control.wablas_schedule_id}`);
        console.log(`   Patient: ${control.nama_pasien}`);
        console.log(`   Status: ${control.isDone ? "Done" : "Pending"}\n`);
      });
    }
  } catch (error) {
    console.error(
      "❌ Error getting schedule reminders:",
      error.response?.data || error.message
    );
  }
}

/**
 * Test Wablas API integration
 */
async function testWablasScheduleAPI() {
  try {
    console.log("\n🧪 Testing Wablas Schedule API Integration...\n");

    const testData = {
      phone: TEST_PHONE,
      message:
        "🧪 Test message from SmedBox Schedule API - please ignore this message",
    };

    const response = await axios.post(
      `${BASE_URL}/schedule/test-wablas-schedule`,
      testData,
      {
        headers: {
          Authorization: `Bearer ${TEST_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Wablas API test successful!");
    console.log("📋 Response:", response.data);
    console.log("⏰ Scheduled for:", response.data.scheduled_for);
  } catch (error) {
    console.error(
      "❌ Error testing Wablas API:",
      error.response?.data || error.message
    );
  }
}

/**
 * Test phone number formatting
 */
function testPhoneFormatting() {
  console.log("\n📱 Testing Phone Number Formatting...\n");

  // This should be imported from wablasScheduleService, but for testing we'll recreate
  const formatPhoneNumber = (phone) => {
    if (!phone) return null;
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.substring(1);
    } else if (cleaned.startsWith("8")) {
      cleaned = "62" + cleaned;
    } else if (!cleaned.startsWith("62")) {
      cleaned = "62" + cleaned;
    }
    return cleaned;
  };

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

/**
 * Run all tests
 */
async function runAllTests() {
  console.log("🚀 WhatsApp Schedule API Tests");
  console.log("=====================================\n");

  // Test phone formatting
  testPhoneFormatting();

  console.log("\n📝 API Tests (requires valid JWT token and phone number):");
  console.log("1. Update TEST_TOKEN with your JWT token");
  console.log("2. Update TEST_PHONE with your phone number");
  console.log("3. Ensure user profile has valid no_hp");
  console.log("4. Uncomment API test code below\n");

  /*
  // Uncomment to test API calls
  const controlId = await testCreateControlWithSchedule();
  
  if (controlId) {
    console.log(`\n✅ Control created with ID: ${controlId}`);
  }
  
  await testManualScheduleCreation();
  await testGetUserScheduleReminders();
  await testWablasScheduleAPI();
  */

  console.log("\n✅ Tests completed!");
}

// Run tests
runAllTests();
